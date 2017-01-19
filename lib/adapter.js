import { persist, retrieve } from 'brandibble/utils';
import Order from 'brandibble/models/order';
import CircularJSON from 'circular-json';

const FiveHundredError = {
  errors: [{
    code: "errors.server.internal",
    title: "Internal Server Error",
    status: 500
  }]
};

/* Ensure the only persisted information here is customer_card_id */
function sanitizeCreditCard(order) {
  if (order.creditCard) {
    let { customer_card_id } = order.creditCard;
    if (customer_card_id) {
      order.creditCard = { customer_card_id };
    } else {
      order.creditCard = null;
    }
  }
  return order;
}

function handleResponse(response) {
  const { status, statusText } = response;
  if (status >= 200 && status < 300) {
    if (statusText === 'NO CONTENT') { return true; }
    return response.json();
  }
  if (status === 500) { throw FiveHundredError; }
  return response.json().then(error => {
    throw error;
  });
}



export default class Adapter {
  constructor({ apiKey, apiBase, storage }) {
    this.apiKey  = apiKey;
    this.apiBase = apiBase;
    this.storage = storage;
  }

  customerId() {
    try {
      return JSON.parse(atob(this.customerToken.split('.')[1])).customer_id
    }
    catch (e) {
      return 0;
    }
  }

  flushAll() {
    return this.storage.clear();
  }

  restoreCurrentOrder() {
    return this.storage.getItem('currentOrder').then(serializedOrder => {
      if (!serializedOrder) return;

      const { locationId, serviceType, miscOptions, requestedAt, cart, paymentType, customer, address, creditCard } = CircularJSON.parse(serializedOrder);

      let order = new Order(this, locationId, serviceType, paymentType, miscOptions);
      if (address) { order.address = address; }
      if (customer) { order.customer = customer; }
      if (paymentType) { order.paymentType = paymentType; }
      if (requestedAt) { order.requestedAt = requestedAt; }
      if (creditCard) { order.creditCard = creditCard; }
      this.currentOrder = order.rehydrateCart(cart);
      return this.currentOrder;
    });
  }

  persistCurrentOrder(order) {
    this.currentOrder = order;
    /* Ensure raw Credit Card data isn't persisted to this.storage */
    if(order.creditCard) {
      let creditCardData = Object.assign({}, order.creditCard);

      return this.storage.setItem('currentOrder', CircularJSON.stringify(sanitizeCreditCard(order))).then(() => {
        order.creditCard = creditCardData;
        return order;
      });
    }
    return this.storage.setItem('currentOrder', CircularJSON.stringify(order)).then(() => order);
  }

  flushCurrentOrder() {
    return this.storage.removeItem('currentOrder');
  }

  restoreCustomerToken() {
    return this.storage.getItem('customerToken').then(customerToken => {
      this.customerToken = customerToken;
    });
  }

  persistCustomerToken(customerToken) {
    return this.storage.setItem('customerToken', customerToken).then(token => {
      this.customerToken = token;
    });
  }

  flushCustomerToken() {
    return this.flushAll().then(() => {
      this.customerToken = null;
    });
  }

  request(method, path, body) {
    return fetch(`${this.apiBase}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : null,
      credentials: 'omit'
    }).then(handleResponse);
  }

  headers() {
    let headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
    if (this.customerToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    return headers;
  }
}
