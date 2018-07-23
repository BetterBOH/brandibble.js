import querystring from 'querystring';

export default class Customers {
  constructor(adapter, events) {
    this.adapter = adapter;
    this.events = events;
  }

  // STATEFUL METHODS
  authenticate(body) {
    return this.token(body).then((response) => {
      return this.adapter.persistCustomerToken(response.data.token).then(this.current.bind(this));
    });
  }

  invalidate() {
    const promise = this.adapter.flushAll();
    this.events.triggerAsync('customers.invalidate', promise);
    return promise;
  }

  current() {
    return this.show(this.adapter.customerId());
  }

  updateCurrent(body) {
    return this.update(body, this.adapter.customerId());
  }

  currentLevelUpQRCode(params = {}) {
    return this.levelUpQRCode(this.adapter.customerId(), params);
  }

  currentLevelUpLoyalty() {
    return this.levelUpLoyalty(this.adapter.customerId());
  }

  currentLevelUpCampaign(campaignId, campaignType) {
    return this.levelUpCampaign(this.adapter.customerId(), campaignId, campaignType);
  }

  // STATELESS METHODS

  /* first_name, last_name, email, password, phone:opt */
  create(body) {
    const promise = this.adapter.request('POST', 'customers', body);
    this.events.triggerAsync('customers.create', promise);
    return promise;
  }

  validateCustomer(body) {
    return this.adapter.request('POST', 'customers/validate', body);
  }

  /* email, password */
  token(body) {
    const promise = this.adapter.request('POST', 'customers/token', body);
    this.events.triggerAsync('customers.token', promise);
    return promise;
  }

  /* customer_id */
  show(customerId) {
    const promise = this.adapter.request('GET', `customers/${customerId}`);
    this.events.triggerAsync('customers.show', promise);
    return promise;
  }

  /* limit, sort, status */
  orders(customerId, params = {}) {
    const query = querystring.stringify(params);
    return this.adapter.request('GET', `customers/${customerId}/orders?${query}`);
  }

  /* first_name, last_name, email, password, phone:opt */
  update(body, customerId) {
    const promise = this.adapter.request('PUT', `customers/${customerId}`, body);
    this.events.triggerAsync('customers.update', promise);
    return promise;
  }

  resetPassword(body) {
    const promise = this.adapter.request('POST', 'customers/reset', body);
    this.events.triggerAsync('customers.resetPassword', promise);
    return promise;
  }

  // LEVELUP

  /* customer_id, code, color, tip_amount, tip_percent, width */
  levelUpQRCode(customerId, params = {}) {
    const query = querystring.stringify(params);
    return this.adapter.request('GET', `customers/${customerId}/levelup/qr_code?${query}`);
  }

  /* customer_id */
  levelUpLoyalty(customerId) {
    return this.adapter.request('GET', `customers/${customerId}/levelup/loyalty`);
  }

  /* update levelup permissions */
  levelUpUpdate(customerId, password) {
    const data = { password };
    return this.adapter.request('PUT', `customers/${customerId}/levelup`, data);
  }

  /* connect level up account */
  levelUpConnect(customerId, email, password) {
    const data = { email };
    if (password) data.password = password;
    return this.adapter.request('POST', `customers/${customerId}/levelup`, data);
  }

  /* show levelup campaign */
  levelUpCampaign(customerId, campaignId, campaignType) {
    return this.adapter.request('GET', `customers/${customerId}/levelup/campaigns/${campaignId}/${campaignType}`);
  }

  /* disconnect level up account */
  levelUpDisconnect(customerId) {
    return this.adapter.request('DELETE', `customers/${customerId}/levelup`);
  }

  levelUpPaymentMethod(customerId) {
    return this.adapter.request('GET', `customers/${customerId}/levelup/payment_method`);
  }

  resetLevelUpPassword(body) {
    const promise = this.adapter.request('POST', 'customers/reset_levelup', body);
    this.events.triggerAsync('customers.resetLevelUpPassword', promise);
    return promise;
  }
}
