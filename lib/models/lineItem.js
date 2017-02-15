import find from 'lodash.find';
import filter from 'lodash.filter';
import map from 'lodash.map';
import compact from 'lodash.compact';
import sortBy from 'lodash.sortby';
import reverse from 'lodash.reverse';
import reduce from 'lodash.reduce';
import validate from 'validate.js';
import { productValidations } from 'brandibble/models/validations';
import { generateUUID } from 'brandibble/utils';

const OptionOperations = {
  ADD: "ADD",
  REMOVE: "REMOVE"
};

const OptionStatus = {
  ABSENT: "ABSENT",
  PRESENT: "PRESENT"
};

export default class LineItem {
  constructor(product, quantity=1, uuid) {
    let result = validate(product, productValidations);
    if (result) throw result;

    /* Allow uuid incase we want to rehyrate this lineItem. */
    this.uuid = uuid || generateUUID();
    this.product = product;
    this.quantity = quantity;
    this.configuration = [];
    this.madeFor = "";
    this.instructions = "";
    this.operationMaps = [];

    this._generateOperationMaps();
  }

  configurationForGroup(groupOrId) {
    let optionGroupId = (typeof groupOrId === "object") ? groupOrId.id : parseInt(groupOrId);
    return find(this.configuration, { optionGroupId });
  }

  addOption(group, item) {
    let groupConfig = this.configurationForGroup(group);
    let canAdd      = group.max_options > (groupConfig ? groupConfig.optionItems.length : 0);

    if (!canAdd) {
      throw {
        error: 'Can not add another option for this group.',
        type: 'option_group',
        subject: group,
        relatedConfiguration: groupConfig
      };
    }

    let match = find(this.configuration, { optionGroupId: group.id });
    if (match) {
      match.optionItems.push(item);
    } else {
      this.configuration.push({
        optionGroupId: group.id,
        optionItems: [item]
      });
    }
    this._generateOperationMaps();
    return true;
  }

  removeOption(item) {
    let groupConfig = this.configurationForGroup(item.group_id);
    if (groupConfig) {
      // TODO: this will remove every option for this id, it should only remove one!
      groupConfig.optionItems = filter(groupConfig.optionItems, oi => oi.id !== item.id);
    }
    this._generateOperationMaps();
    return groupConfig;
  }

  isValid() {
    return this.errors().length === 0;
  }

  hasOptionGroups() {
    return this.optionGroups().length > 0;
  }

  optionGroups() {
    return this.product.option_groups || [];
  }

  errors() {
    let optionGroups = this.product.option_groups || [];
    return compact(
      map(optionGroups, group => {
        let match = find(this.configuration, { optionGroupId: group.id });
        let count = match ? match.optionItems.length : 0;
        if (count < group.min_options) {
          return {
            error: 'Too Few Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: this.configurationForGroup(group)
          };
        }
        if (count > group.max_options) {
          return {
            error: 'Too Many Options added for this Group.',
            subjectType: 'option_group',
            subject: group,
            relatedConfiguration: this.configurationForGroup(group)
          };
        }
      })
    );
  }

  format() {
    return {
      id: this.product.id,
      made_for: this.madeFor,
      instructions: this.instructions,
      quantity: this.quantity,
      option_groups: map(this.configuration, g => {
        return {
          id: g.optionGroupId,
          option_items: map(g.optionItems, oi => { return { id: oi.id } })
        }
      })
    }
  }

  _generateOperationMaps() {
    let maps = sortBy(map(this.optionGroups(), optionGroup => {

      let configGroup               = this.configurationForGroup(optionGroup.id);
      let currentlySelectedCount    = configGroup ? configGroup.optionItems.length : 0;
      let canAddMoreToThisGroup     = currentlySelectedCount < optionGroup.max_options;
      let requiresMoreInThisGroup   = currentlySelectedCount < optionGroup.min_options;
      let remainingIncludedOptions  = optionGroup.included_options - currentlySelectedCount;
      let additionalOptionsCount    = currentlySelectedCount - optionGroup.included_options;
      let extraOptionsWillIncurCost = canAddMoreToThisGroup ? remainingIncludedOptions === 0 : false;
      if (remainingIncludedOptions < 0) { remainingIncludedOptions = 0; }
      if (additionalOptionsCount < 0) { additionalOptionsCount = 0; }

      return {
        id: optionGroup.id,
        optionGroupData: optionGroup,
        name: optionGroup.name,
        canAddMoreToThisGroup,
        requiresMoreInThisGroup,
        extraOptionsWillIncurCost,
        currentlySelectedCount,
        totalAllowedCount: optionGroup.max_options,
        remainingIncludedOptions,
        additionalOptionsCount,
        totalEffectOnPrice: "0.00", /* This is overriden in the pricing loop below */
        optionItems: sortBy(map(optionGroup.option_items, option => {
          /* Find all currently added options of the same id */
          let matchingOptionItems = configGroup ? filter(configGroup.optionItems, { id: option.id }) : [];
          let quantity = matchingOptionItems.length;
          let presence = quantity > 0 ? OptionStatus.PRESENT : OptionStatus.ABSENT;

          /* Build the allowd Operations here */
          let allowedOperations = [];
          if (canAddMoreToThisGroup) {
            allowedOperations.push({
              operation: OptionOperations.ADD,
              costPerOperation: extraOptionsWillIncurCost ? option.price : "0.00"
            });
          }
          if (presence === OptionStatus.PRESENT) {
            allowedOperations.push({
              operation: OptionOperations.REMOVE,
              costPerOperation: "0.00" /* Overriden Later in Pricing Loop */
            });
          }
          return {
            optionId: option.id,
            optionItemData: option,
            costPerUnit: option.price,
            presence,
            allowedOperations,
            quantity,
            effectOnPrice: "0.00", /* Overriden Later in Pricing Loop */
            quantityContributingToPrice: 0 /* Overriden Later in Pricing Loop */
          };
        }), i => i.menu_position)
      }
    }), i => i.menu_position);

    /* Loop through all options and determine cost incurred for each */
    maps.forEach(operationMap => {
      /* No additional options are selected, so set everything to "0.00" */
      if (operationMap.additionalOptionsCount === 0) { return; }

      /* Additional Options are selected, so sort the optionItems array to find the most expensive */
      let mostExpensivePresentOptionItems = reverse(sortBy(
        filter(operationMap.optionItems, i => i.presence === OptionStatus.PRESENT),
        i => parseFloat(i.costPerUnit)
      ));

      /* Now work backwards from most expensive and attribute item to price */
      let catchup = 0;
      mostExpensivePresentOptionItems.forEach(item => {
        let catchupRequired = operationMap.additionalOptionsCount - catchup;
        if (catchupRequired >= item.quantity) {
          item.effectOnPrice = (parseFloat(item.costPerUnit) * item.quantity).toFixed(2);
          item.quantityContributingToPrice = item.quantity;
          let removalOperation = find(item.allowedOperations, o => o.operation === OptionOperations.REMOVE);
          removalOperation.costPerOperation = item.costPerUnit;
          catchup += item.quantity;
        } else {
          item.effectOnPrice = (parseFloat(item.costPerUnit) * item.quantity).toFixed(2);
          item.quantityContributingToPrice = item.quantity;
          catchup += catchupRequired;
        }
      });
      operationMap.totalEffectOnPrice = reduce(mostExpensivePresentOptionItems, (sum, item) => {
        return parseFloat(item.effectOnPrice) + sum;
      }, 0.00).toFixed(2);
    });
    this.operationMaps = maps;
    return maps;
  }
}
