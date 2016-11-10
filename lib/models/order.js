import Cart from 'brandibble/models/cart';
import validate from 'validate.js';
import {
  customerValidations,
  addressValidations,
  cardValidations
} from 'brandibble/models/validations';

const defaultOptions = {
  include_utensils: true,
  notes_for_store: "",
  tip: 0
};

const ASAP_STRING = 'asap';
const ISO8601_PATTERN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

export default class Order {
  constructor(adapter, location_id, serviceType='delivery', miscOptions=defaultOptions) {
    this.adapter = adapter;
    this.cart = new Cart();
    this.locationId = location_id;
    this.serviceType = serviceType;
    this.miscOptions = miscOptions;
    this.requestedAt = ASAP_STRING;
  }

  rehydrateCart(serializedCart={}) {
    (serializedCart['lineItems'] || []).forEach(serializedLineItem => {
      const { product, quantity, madeFor, instructions, configuration, uuid } = serializedLineItem;
      /* Important: add directly from cart to avoid new writes to localforage */
      let lineItem = this.cart.addLineItem(product, quantity, uuid);
      lineItem.madeFor = madeFor;
      lineItem.instructions = instructions;
      lineItem.configuration = configuration;
    });
    return this;
  }

  setRequestedAt(timestampOrAsap=ASAP_STRING) {
    if (timestampOrAsap === ASAP_STRING) {
      this.requestedAt = ASAP_STRING;
      return this.adapter.persistCurrentOrder(this);
    } else {
      let result = validate({timestamp: timestampOrAsap}, {timestamp: {format: ISO8601_PATTERN}});
      if (!result) {
        this.requestedAt = timestampOrAsap;
        return this.adapter.persistCurrentOrder(this);
      }
      return Promise.reject(result);
    }
  }

  setCustomer(customer) {
    let { customer_id } = customer;
    if (customer_id) {
      this.customer = { customer_id };
      return this.adapter.persistCurrentOrder(this);
    }
    let result = validate(customer, customerValidations);
    if (!result) {
      this.customer = customer;
      return this.adapter.persistCurrentOrder(this);
    }
    return Promise.reject(result);
  }

  setAddress(address) {
    let { customer_address_id } = address;
    if (customer_address_id) {
      this.address = { customer_address_id };
      return this.adapter.persistCurrentOrder(this);
    }
    let result = validate(address, addressValidations);
    if (!result) {
      this.address = address;
      return this.adapter.persistCurrentOrder(this);
    }
    return Promise.reject(result);
  }

  isValid() {
    return this.cart.isValid();
  }

  addLineItem() {
    let lineItem = this.cart.addLineItem(...arguments);
    return this.adapter.persistCurrentOrder(this).then(() => lineItem);
  }

  addOptionToLineItem() {
    let lineItem = this.cart.addOptionToLineItem(...arguments);
    return this.adapter.persistCurrentOrder(this).then(() => lineItem);
  }

  removeOptionFromLineItem() {
    let lineItem = this.cart.removeOptionFromLineItem(...arguments);
    return this.adapter.persistCurrentOrder(this).then(() => lineItem);
  }

  getLineItemQuantity() {
    return this.cart.getLineItemQuantity(...arguments);
  }

  setLineItemQuantity() {
    let lineItem = this.cart.setLineItemQuantity(...arguments);
    return this.adapter.persistCurrentOrder(this).then(() => lineItem);
  }

  removeLineItem() {
    let remainingLineItems = this.cart.removeLineItem(...arguments);
    return this.adapter.persistCurrentOrder(this).then(() => remainingLineItems);
  }

  formatForValidation() {
    return {
      location_id: this.locationId,
      service_type: this.serviceType,
      requested_at: this.requestedAt,
      cart: this.cart.format()
    }
  }

  formatCustomer() {
    if (!this.customer) { return {}; }
    if (this.customer.customer_id) { return { customer_id: this.customer.customer_id }; }
    return {
      email: this.customer.email,
      password: this.customer.password,
      first_name: this.customer.first_name,
      last_name: this.customer.last_name
    }
  }

  formatAddress() {
    if (!this.address) { return {}; }
    const {
      customer_address_id, city, longitude, latitude, state_code, street_address, zip_code, unit, company, contact_name, contact_phone
    } = this.address;
    if (customer_address_id) { return { customer_address_id }; }
    return {
      city, longitude, latitude, state_code, street_address, zip_code, unit, company, contact_name, contact_phone
    }
  }

  formatCard(card) {
    if (!card) { return {}; }
    const { customer_card_id, cc_expiration, cc_number, cc_zip, cc_cvv } = card;
    if (customer_card_id) { return { customer_card_id }; }
    return { cc_expiration, cc_number, cc_zip, cc_cvv };
  }

  format(payment_type="cash", card) {
    const { include_utensils, notes_for_store, tip } = this.miscOptions;

    let payload = {
      address: this.formatAddress(),
      customer: this.formatCustomer(),
      location_id: this.locationId,
      service_type: this.serviceType,
      requested_at: this.requestedAt,
      cart: this.cart.format(),
      include_utensils,
      notes_for_store,
      payment_type
    };

    if (payload.payment_type === "credit") { payload.credit_card = this.formatCard(card); }
    if (payload.payment_type !== "cash") { payload.tip = tip; }

    return payload;
  }
}
