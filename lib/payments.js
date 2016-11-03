export default class Payments {
  constructor(adapter) {
    this.adapter = adapter;
  }

  all() {
    return this.adapter.request('GET', `customers/${this.adapter.customerId()}/cards`);
  }
}
