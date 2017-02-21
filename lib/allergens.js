export default class Allergens {
  constructor(adapter) {
    this.adapter = adapter;
  }

  all() {
    return this.adapter.request('GET', `allergens`);
  }

  create(allergensArr) {
    const data = {
      allergens: allergensArr,
    }
    return this.adapter.request('POST', `customers/${this.adapter.customerId()}/allergens`, data);
  }

  remove(allergensArr) {
    const data = {
      allergens: allergensArr,
    }
    return this.adapter.request('DELETE', `customers/${this.adapter.customerId()}/allergens`, data);
  }
}
