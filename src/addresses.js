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

  delete(customerAddressId) {
    return this.adapter.request('DELETE', `customers/${this.adapter.customerId()}/addresses/${customerAddressId}`);
  }

  setDefault(customerAddressId) {
    return this.adapter.request('PUT', `customers/${this.adapter.customerId()}/addresses/${customerAddressId}`, { is_default: true });
  }
}