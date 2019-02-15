export default class Brands {
  constructor(adapter) {
    this.adapter = adapter;
  }

  current() {
    return this.show()
  }

  /**
   * Currently the brands#show endpoint is the same as adapter.apiBase. So we 
   * can pass an empty string as the path in order to form a request at the root
   * of the apiBase.
   */
  show() {
    return this.adapter.request('GET', '');
  }
};
