import Cart from 'brandibble/models/cart';

const defaultOptions = {
  include_utensils: true,
  notes_for_store: "",
  payment_type: "credit",
  tip: 0
};

export default class Order {
  constructor(location, serviceType='delivery', miscOptions=defaultOptions) {
    this.cart = new Cart();
    this.location = location;
    this.serviceType = serviceType;
    this.miscOptions = miscOptions;
  }

  setCustomer(customer) {
    // TODO: Validate
    // email / last_name / first_name / password
    this.customer = customer;
  }

  setAddress(address) {
    // TODO: Validate
    // address attrs
    this.address = address;
  }

  setCard(card) {
    // TODO: Validate
    // expiration, card_number, zip_code, cvv
    this.card = card;
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
      location_id: this.location.location_id,
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
    const { card_id, expiration, card_number, zip_code, cvv } = this.card;
    if (card_id) { return { card_id }; }
    return { expiration, card_number, zip_code, cvv };
  }

  format() {
    const { include_utensils, notes_for_store, payment_type, tip } = this.miscOptions;

    let payload = {
      address: this.formatAddress(),
      customer: this.formatCustomer(),
      location_id: this.location.location_id,
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
