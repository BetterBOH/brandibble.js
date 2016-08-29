import Cart from 'brandibble/models/cart';
import validate from 'validate.js';
import { customerValidations, cardValidations } from 'brandibble/models/validations';

const defaultOptions = {
  include_utensils: true,
  notes_for_store: "",
  payment_type: "credit",
  tip: 0
};

export default class Order {
  constructor(location_id, serviceType='delivery', miscOptions=defaultOptions) {
    this.cart = new Cart();
    this.location_id = location_id;
    this.serviceType = serviceType;
    this.miscOptions = miscOptions;
  }

  setCustomer(customer) {
    let { customer_id } = customer;
    if (customer_id) {
      this.customer = { customer_id };
      return true;
    }
    let result = validate(customer, customerValidations);
    if (!result) {
      this.customer = customer;
      return true;
    }
    return result;
  }

  setAddress(address) {
    // TODO: Validate
    // address attrs
    this.address = address;
  }

  setCard(card) {
    let { customer_card_id } = card;
    if (customer_card_id) {
      this.card = { customer_card_id };
      return true;
    }
    let result = validate(card, cardValidations);
    if (!result) {
      this.card = card;
      return true;
    }
    return result;
  }

  isValid() {
    return this.cart.isValid();
  }

  addLineItem() {
    return this.cart.addLineItem(...arguments);
  }

  getLineItemQuantity() {
    return this.cart.getLineItemQuantity(...arguments);
  }

  setLineItemQuantity() {
    return this.cart.setLineItemQuantity(...arguments);
  }

  removeLineItem() {
    return this.cart.removeLineItem(...arguments);
  }

  formatForValidation() {
    return {
      location_id: this.location_id,
      service_type: this.serviceType,
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

  formatCard() {
    if (!this.card) { return {}; }
    // TODO: Need card_id info from JC
    const { customer_card_id, cc_expiration, cc_number, cc_zip, cc_cvv } = this.card;
    if (customer_card_id) { return { customer_card_id }; }
    return { cc_expiration, cc_number, cc_zip, cc_cvv };
  }

  format() {
    const { include_utensils, notes_for_store, payment_type, tip } = this.miscOptions;

    let payload = {
      address: this.formatAddress(),
      customer: this.formatCustomer(),
      location_id: this.location_id,
      service_type: this.serviceType,
      cart: this.cart.format(),
      include_utensils,
      notes_for_store,
      payment_type,
    };

    if (payload.payment_type === "credit") { payload.credit_card = this.formatCard(); }
    if (payload.payment_type !== "cash") { payload.tip = tip; }

    return payload;
  }
}
