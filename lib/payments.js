export default class Payments {
  constructor(adapter) {
    this.adapter = adapter;
  }

  all() {
    return this.adapter.request('GET', `customers/${this.adapter.customerId()}/cards`);
  }

  create(body) {
    return this.adapter.request('POST', `customers/${this.adapter.customerId()}/cards`, body);
  }
}
