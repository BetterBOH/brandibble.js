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
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

const OptionStatus = {
  ABSENT: 'ABSENT',
  PRESENT: 'PRESENT',
};

export default class LineItem {
  constructor(product, quantity = 1, uuid) {
    const result = validate(product, productValidations);
    if (result) throw result;

    /* Allow uuid incase we want to rehyrate this lineItem. */
    this.uuid = uuid || generateUUID();
    this.product = product;
    this.quantity = quantity;
    this.configuration = [];
    this.madeFor = '';
    this.instructions = '';
    this.operationMaps = [];

    this._generateOperationMaps();
  }

  configurationForGroup(groupOrId) {
    const optionGroupId = (typeof groupOrId === 'object') ? groupOrId.id : parseInt(groupOrId);
    return find(this.configuration, { optionGroupId });
  }

  addOption(group, item) {
    const groupConfig = this.configurationForGroup(group);
    const canAdd = group.max_options > (groupConfig ? groupConfig.optionItems.length : 0);

    if (!canAdd) {
      const error = {
        error: 'Can not add another option for this group.',
        type: 'option_group',
        subject: group,
        relatedConfiguration: groupConfig,
      };
      throw error;
    }

    const match = find(this.configuration, { optionGroupId: group.id });
    if (match) {
      match.optionItems.push(item);
    } else {
      this.configuration.push({
        optionGroupId: group.id,
        optionItems: [item],
      });
    }
    this._generateOperationMaps();
    return true;
  }

  removeOption(item) {
    const match = find(this.configuration, { optionGroupId: item.group_id });
    const firstMatchingOptionItem = find(match.optionItems, oi => oi.id === item.id);
    if (!firstMatchingOptionItem) return false;
    match.optionItems.splice(match.optionItems.indexOf(firstMatchingOptionItem), 1);
    this._generateOperationMaps();
    return true;
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
    const optionGroups = this.product.option_groups || [];
    return compact(map(optionGroups, (group) => {
      const match = find(this.configuration, { optionGroupId: group.id });
      const count = match ? match.optionItems.length : 0;
      if (count < group.min_options) {
        return {
          error: 'Too Few Options added for this Group.',
          subjectType: 'option_group',
          subject: group,
          relatedConfiguration: this.configurationForGroup(group),
        };
      }
      if (count > group.max_options) {
        return {
          error: 'Too Many Options added for this Group.',
          subjectType: 'option_group',
          subject: group,
          relatedConfiguration: this.configurationForGroup(group),
        };
      }
    }));
  }

  format() {
    const mapItems = ({ id }) => ({ id });
    const mapGroup = group => ({
      id: group.optionGroupId,
      option_items: map(group.optionItems, mapItems),
    });
    const option_groups = map(this.configuration, mapGroup);

    return {
      id: this.product.id,
      made_for: this.madeFor,
      instructions: this.instructions,
      quantity: this.quantity,
      option_groups,
    };
  }

  _generateOperationMaps() {
    const maps = sortBy(map(this.optionGroups(), (optionGroup) => {
      const configGroup = this.configurationForGroup(optionGroup.id);
      const currentlySelectedCount = configGroup ? configGroup.optionItems.length : 0;
      const canAddMoreToThisGroup = currentlySelectedCount < optionGroup.max_options;
      const requiresMoreInThisGroup = currentlySelectedCount < optionGroup.min_options;

      let remainingIncludedOptions = optionGroup.included_options - currentlySelectedCount;
      let additionalOptionsCount = currentlySelectedCount - optionGroup.included_options;

      const extraOptionsWillIncurCost = canAddMoreToThisGroup ? remainingIncludedOptions === 0 : false;

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
        totalEffectOnPrice: '0.00', /* This is overriden in the pricing loop below */
        optionItems: sortBy(map(optionGroup.option_items, (option) => {
          /* Find all currently added options of the same id */
          const matchingOptionItems = configGroup ? filter(configGroup.optionItems, { id: option.id }) : [];
          const quantity = matchingOptionItems.length;
          const presence = quantity > 0 ? OptionStatus.PRESENT : OptionStatus.ABSENT;

          /* Build the allowd Operations here */
          const allowedOperations = [];
          if (canAddMoreToThisGroup) {
            allowedOperations.push({
              operation: OptionOperations.ADD,
              costPerOperation: extraOptionsWillIncurCost ? option.price : '0.00',
            });
          }
          if (presence === OptionStatus.PRESENT) {
            allowedOperations.push({
              operation: OptionOperations.REMOVE,
              costPerOperation: '0.00', /* Overriden Later in Pricing Loop */
            });
          }
          return {
            optionId: option.id,
            optionItemData: option,
            costPerUnit: option.price,
            presence,
            allowedOperations,
            quantity,
            effectOnPrice: '0.00', /* Overriden Later in Pricing Loop */
            quantityContributingToPrice: 0, /* Overriden Later in Pricing Loop */
          };
        }), i => i.menu_position),
      };
    }), i => i.menu_position);

    /* Loop through all options and determine cost incurred for each */
    maps.forEach((operationMap) => {
      const _operationMap = operationMap;
      /* No additional options are selected, so set everything to "0.00" */
      if (_operationMap.additionalOptionsCount === 0) { return; }

      /* Additional Options are selected, so sort the optionItems array to find the most expensive */
      const presentItems = filter(_operationMap.optionItems, i => i.presence === OptionStatus.PRESENT);
      const mostExpensivePresentOptionItems = reverse(sortBy(presentItems, i => parseFloat(i.costPerUnit)));

      /* Now work backwards from most expensive and attribute item to price */
      let catchup = 0;
      mostExpensivePresentOptionItems.forEach((item) => {
        const _item = item;
        const catchupRequired = _operationMap.additionalOptionsCount - catchup;
        if (catchupRequired >= _item.quantity) {
          _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantity).toFixed(2);
          _item.quantityContributingToPrice = _item.quantity;
          const removalOperation = find(_item.allowedOperations, o => o.operation === OptionOperations.REMOVE);
          removalOperation.costPerOperation = _item.costPerUnit;
          catchup += _item.quantity;
        } else {
          _item.quantityContributingToPrice = catchupRequired;
          _item.effectOnPrice = (parseFloat(_item.costPerUnit) * _item.quantityContributingToPrice).toFixed(2);
          catchup += catchupRequired;
        }
        return _item;
      });

      const getTotal = (sum, item) => parseFloat(item.effectOnPrice) + sum;
      _operationMap.totalEffectOnPrice = reduce(mostExpensivePresentOptionItems, getTotal, 0.00).toFixed(2);
    });
    this.operationMaps = maps;
    return maps;
  }
}
