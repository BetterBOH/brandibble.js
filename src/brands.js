export default class Brands {
  constructor(adapter) {
    this.adapater = adapter;
  }

  current() {
    return this.show()
  }

  show() {
    return this.adapter.request('GET');
  }
};
