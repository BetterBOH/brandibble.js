/* global atob fetch */
import Order from 'brandibble/models/order';
import CircularJSON from 'circular-json';

function BrandibbleRequestException(message, response, exception, extracted) {
  this.message = `Brandibble.js: ${message || 'An unknown exception was triggered.'}`;
  this.stack = (new Error()).stack;
  this.response = response;
  this.exception = exception;
  this.extracted = extracted;
}

const FiveHundredError = {
  errors: [{
    code: 'errors.server.internal',
    title: 'Internal Server Error',
    status: 500,
  }],
};

/* Ensure the only persisted information here is customer_card_id */
function sanitizeCreditCard(order) {
  const _order = order;
  if (_order.creditCard) {
    const { customer_card_id } = _order.creditCard;
    if (customer_card_id) {
      _order.creditCard = { customer_card_id };
    } else {
      _order.creditCard = null;
    }
  }
  return _order;
}

/*
 * Brandibble 500 Errors aren't JSON, so we wrap them
 * here.  Otherwise, we attempt to parse everything as
 * JSON, and in the case we can't, we throw a big' ol
 * error, that is intended to be used with error logging.
 */
function handleResponse(response) {
  const { status, statusText } = response;
  if (status === 500) { throw FiveHundredError; }
  if (statusText === 'NO CONTENT' || status === 204) { return true; }
  /* Store a clone so the host app can re-read the error */
  const cloned = response.clone() ? response.clone() : response;
  try {
    return response.text().then((text) => {
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new BrandibbleRequestException('Response text could not be parsed as JSON.', cloned, e, text);
      }
    });
  } catch (e) {
    throw new BrandibbleRequestException('Response could not extracted as Text.', cloned, e);
  }
}


export default class Adapter {
  constructor({ apiKey, apiBase, origin, storage, requestTimeout }) {
    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.origin = origin;
    this.storage = storage;
    this.requestTimeout = requestTimeout;

    /* Lifecycle Specific State */
    this.currentOrder = null;
    this.customerToken = null;
  }

  customerId() {
    try {
      return JSON.parse(atob(this.customerToken.split('.')[1])).customer_id;
    } catch (e) {
      return 0;
    }
  }

  flushAll() {
    return this.storage.clear().then((res) => {
      this.currentOrder = null;
      this.customerToken = null;
      return res;
    });
  }

  restoreCurrentOrder() {
    return this.storage.getItem('currentOrder').then((serializedOrder) => {
      if (!serializedOrder) return;

      const { locationId, serviceType, miscOptions, requestedAt, cart, paymentType, customer, address, creditCard } = CircularJSON.parse(serializedOrder);

      const order = new Order(this, locationId, serviceType, paymentType, miscOptions);
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
    const _order = order;
    this.currentOrder = _order;
    /* Ensure raw Credit Card data isn't persisted to this.storage */
    if (_order.creditCard) {
      const creditCardData = Object.assign({}, _order.creditCard);

      return this.storage.setItem('currentOrder', CircularJSON.stringify(sanitizeCreditCard(_order))).then(() => {
        _order.creditCard = creditCardData;
        return _order;
      });
    }
    return this.storage.setItem('currentOrder', CircularJSON.stringify(_order)).then(() => _order);
  }

  flushCurrentOrder() {
    return this.storage.removeItem('currentOrder').then((res) => {
      this.currentOrder = null;
      return res;
    });
  }

  restoreCustomerToken() {
    return this.storage.getItem('customerToken').then((customerToken) => {
      return this.customerToken = customerToken;
    });
  }

  persistCustomerToken(customerToken) {
    return this.storage.setItem('customerToken', customerToken).then(() => {
      return this.storage.getItem('customerToken').then((token) => {
        return this.customerToken = token;
      });
    });
  }

  request(method, path, body) {
    if (this.requestTimeout) {
      return new Promise((resolve, reject) => {
        const timerId = setTimeout(() => {
          reject(new Error(`Brandibble.js: The ${method} request to ${path} timed out after ${this.requestTimeout}.`));
        }, this.requestTimeout);
        fetch(`${this.apiBase}${path}`, {
          method,
          headers: this.headers(),
          body: body ? JSON.stringify(body) : null,
          credentials: 'omit',
        }).then((response) => {
          clearTimeout(timerId);
          return response;
        }).then(handleResponse).then(resolve, reject);
      });
    }
    return fetch(`${this.apiBase}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : null,
      credentials: 'omit',
    }).then(handleResponse);
  }

  headers() {
    const headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
    if (this.origin) { headers.Origin = this.origin; }
    if (this.customerToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    return headers;
  }
}
