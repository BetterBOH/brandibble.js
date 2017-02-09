import querystring from 'querystring';

export default class Customers {
  constructor(adapter) {
    this.adapter = adapter;
  }

  // STATEFUL METHODS
  authenticate(body) {
    return this.token(body).then(response => {
      return this.adapter.persistCustomerToken(response.data.token).then(this.current.bind(this));
    });
  }

  invalidate() {
    return new Promise(resolve => {
      this.adapter.flushAll().then(resolve);
    });
  }

  current() {
    return this.show(this.adapter.customerId());
  }

  updateCurrent(body) {
    return this.update(body, this.adapter.customerId());
  }

  // STATELESS METHODS

  /* first_name, last_name, email, password, phone:opt */
  create(body) {
    return this.adapter.request('POST', 'customers', body);
  }

  validateCustomer(body) {
    return this.adapter.request('POST', 'customers/validate', body);
  }

  /* email, password */
  token(body) {
    return this.adapter.request('POST', 'customers/token', body);
  }

  /* customer_id */
  show(customerId) {
    return this.adapter.request('GET', `customers/${customerId}`);
  }

  /* limit, sort, status */
  orders(customerId, params={}) {
    const query = querystring.stringify(params);
    return this.adapter.request('GET', `customers/${customerId}/orders?${query}`);
  }

  /* first_name, last_name, email, password, phone:opt */
  update(body, customerId) {
    return this.adapter.request('PUT', `customers/${customerId}`, body);
  }

  resetPassword(body) {
    return this.adapter.request('POST', 'customers/reset', body);
  }
}
