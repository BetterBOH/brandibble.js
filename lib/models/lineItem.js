import find from 'lodash.find';
import filter from 'lodash.filter';
import map from 'lodash.map';
import compact from 'lodash.compact';
import validate from 'validate.js';
import { productValidations } from 'brandibble/models/validations';
import { generateUUID } from 'brandibble/utils';

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
  }

  configurationForGroup(groupOrId) {
    let optionGroupId = (typeof groupOrId === "object") ? groupOrId.id : parseInt(groupOrId);
    return find(this.configuration, { optionGroupId });
  }

  addOption(group, item) {
    let groupConfig = this.configurationForGroup(group);
    let canAdd      = group.max_options > (groupConfig ? groupConfigoptionItems.length : 0);

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
    return true;
  }

  removeOption(item) {
    let groupConfig = this.configurationForGroup(item.group_id);
    if (groupConfig) {
      groupConfig.optionItems = filter(groupConfig.optionItems, oi => oi.id !== item.id);
    }
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
}
