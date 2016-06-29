export default class Addresses {
  constructor(adapter) {
    this.adapter = adapter;
  }

  all() {
    return this.adapter.request('GET', `customers/${this.adapter.customerId()}/addresses`);
  }

  create(body) {
    return this.adapter.request('POST', `customers/${this.adapter.customerId()}/addresses`, body);
  }
}
