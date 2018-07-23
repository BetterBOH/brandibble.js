import every from 'lodash.every';
import find from 'lodash.find';
import map from 'lodash.map';
import reject from 'lodash.reject';
import LineItem from './lineItem';

export default class Cart {
  constructor() {
    this.lineItems = [];
  }

  isValid() {
    return every(map(this.lineItems, lineItem => lineItem.isValid()));
  }

  addLineItem(product, quantity = 1, uuid) {
    const lineItem = new LineItem(product, quantity, uuid);
    this.lineItems.push(lineItem);
    return lineItem;
  }

  addOptionToLineItem(lineItem, group, item) {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { return match.addOption(group, item); }
    return false;
  }

  removeOptionFromLineItem(lineItem, item) {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { return match.removeOption(item); }
    return false;
  }

  getLineItemQuantity(lineItem) {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { return match.quantity; }
    return 0;
  }

  setLineItemMadeFor(lineItem, madeFor = '') {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { match.madeFor = madeFor; return madeFor; }
    return false;
  }

  setLineItemInstructions(lineItem, instructions = '') {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { match.instructions = instructions; return instructions; }
    return false;
  }

  setLineItemQuantity(lineItem, quantity = 1) {
    const match = find(this.lineItems, { uuid: lineItem.uuid });
    if (match) { match.quantity = quantity; return quantity; }
    return false;
  }

  removeLineItem(lineItem) {
    this.lineItems = reject(this.lineItems, { uuid: lineItem.uuid });
    return this.lineItems;
  }

  format() {
    return map(this.lineItems, lineItem => lineItem.format());
  }
}
