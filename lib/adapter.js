import { persist, retrieve } from 'brandibble/utils';
import localforage from 'localforage';
import Order from 'brandibble/models/order';

const FiveHundredError = {
  errors: [{
    code: "errors.server.internal",
    title: "Internal Server Error",
    status: 500
  }]
};

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

localforage.config({
  storeName: 'brandibble'
});

export default class Adapter {
  constructor({ apiKey, apiBase }) {
    this.apiKey  = apiKey;
    this.apiBase = apiBase;
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
    return localforage.clear();
  }

  restoreCurrentOrder() {
    return localforage.getItem('currentOrder').then(serializedOrder => {
      if (!serializedOrder) return;

      const { locationId, serviceType, miscOptions, requestedAt, cart, customer, address } = serializedOrder;
      let order = new Order(this, locationId, serviceType, miscOptions);
      if (address) { order.address = address; }
      if (customer) { order.customer = customer; }
      if (requestedAt) { order.requestedAt = requestedAt; }
      this.currentOrder = order.rehydrateCart(cart);
      return this.currentOrder;
    });
  }

  persistCurrentOrder(order) {
    this.currentOrder = order;
    return localforage.setItem('currentOrder', order).then(() => order);
  }

  flushCurrentOrder() {
    return localforage.removeItem('currentOrder');
  }

  restoreCustomerToken() {
    return localforage.getItem('customerToken').then(customerToken => {
      this.customerToken = customerToken;
    });
  }

  persistCustomerToken(customerToken) {
    return localforage.setItem('customerToken', customerToken).then(token => {
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
