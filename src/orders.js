import find from 'lodash.find';
import reduce from 'lodash.reduce';
import Order from './models/order';
import LineItem from './models/lineItem';
import { extractAdapterOverrides } from './utils';

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
      (item.option_groups || []).forEach((itemOptionGroup) => {
        const productOptionGroup = find(
          product.option_groups,
          og => og.id === itemOptionGroup.id,
        );
        if (!productOptionGroup) throw new Error({ message: 'Option Group Missing' });

        itemOptionGroup.option_items.forEach((foi) => {
          const productOptionItem = find(
            productOptionGroup.option_items,
            oi => oi.id === foi.id,
          );
          if (!productOptionItem) throw new Error({ message: 'Option Item Missing' });

          const lineItemOptionGroup = find(
            lineItem.configuration,
            config => config.optionGroupId === productOptionGroup.id,
          );

          // we only want to add this option to the line item if it isn't already present.
          // even though we've constructed a new LineItem above, its configuration
          // property could be populated if it has any default options
          if (
            !lineItemOptionGroup ||
            !find(lineItemOptionGroup.optionItems, i => i.id === productOptionItem.id)
          ) {
            lineItem.addOption(productOptionGroup, productOptionItem);
          }
        });
      });
    } catch (e) {
      return;
    }
    return lineItem;
  }

  /* The only attrs testChanges accepts are location_id, service_type & requested_at  */
  validateCart(orderObj, testChanges = {}, options = {}) {
    const body = orderObj.formatForValidation();
    /* Don't send staged password to validate endpoints */
    if (body.customer && body.customer.password) {
      delete body.customer.password;
    }
    Object.assign(body, testChanges);
    return this.adapter.request('POST', 'cart/validate', body, extractAdapterOverrides(options));
  }

  validate(orderObj, options = {}) {
    const body = orderObj.format();
    /* Don't send staged password to validate endpoints */
    if (body.customer && body.customer.password) {
      delete body.customer.password;
    }
    return this.adapter.request('POST', 'orders/validate', body, extractAdapterOverrides(options));
  }

  submit(orderObj, options = {}) {
    const body = orderObj.format();
    if (options && options.includeItemDetails) {
      body.include_item_details = true;
    }
    const promise = this.adapter.request('POST', 'orders/create', body);
    this.events.triggerAsync('orders.submit', promise);
    return promise;
  }
}
