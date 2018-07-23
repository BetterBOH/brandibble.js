import find from 'lodash.find';
import reduce from 'lodash.reduce';
import Order from './models/order';
import LineItem from './models/lineItem';

export default class Orders {
  constructor(adapter, events) {
    this.adapter = adapter;
    this.events = events;
  }

  create(locationId, serviceType, paymentType, miscOptions) {
    const order = new Order(this.adapter, locationId, serviceType, paymentType, miscOptions);
    return this.adapter.persistCurrentOrder(order);
  }

  current() {
    return this.adapter.currentOrder;
  }

  buildLineItemOrphan(...args) {
    return this.constructor.buildLineItemOrphan(...args);
  }

  static buildLineItemOrphan(item, menuJSON) {
    const sections = reduce((menuJSON || []), (combined, section) => {
      return [...combined, ...section.children, ...section.items];
    }, []);

    if (!sections || sections && !sections.length) return;

    const product = find(sections, i => i.id === item.id);
    const lineItem = new LineItem(product);

    try {
      (item.option_groups || []).forEach((iog) => {
        const optionGroup = find(product.option_groups, og => og.id === iog.id);
        if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
        iog.option_items.forEach((foi) => {
          const optionItem = find(optionGroup.option_items, oi => oi.id === foi.id);
          if (!optionItem) throw new Error({ message: 'Option Item Missing' });
          lineItem.addOption(optionGroup, optionItem);
        });
      });
    } catch (e) {
      return;
    }
    return lineItem;
  }

  /* The only attrs testChanges accepts are location_id, service_type & requested_at  */
  validateCart(orderObj, testChanges = {}) {
    const body = orderObj.formatForValidation();
    Object.assign(body, testChanges);
    return this.adapter.request('POST', 'cart/validate', body);
  }

  validate(orderObj) {
    const body = orderObj.format();
    return this.adapter.request('POST', 'orders/validate', body);
  }

  submit(orderObj) {
    const body = orderObj.format();
    const promise = this.adapter.request('POST', 'orders/create', body);
    this.events.triggerAsync('orders.submit', promise);
    return promise;
  }
}
