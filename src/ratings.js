export default class Ratings {
  constructor(adapter) {
    this.adapter = adapter;
  }

  /* rating:integer(1-5):required, comments:string */
  create(orderId, body) {
    return this.adapter.request('POST', `orders/${orderId}/rating`, body);
  }

  /* rating:integer(1-5):required, comments:string */
  update(orderId, body) {
    return this.adapter.request('PUT', `orders/${orderId}/rating`, body);
  }

  show(orderId) {
    return this.adapter.request('GET', `orders/${orderId}/rating`);
  }

  delete(orderId) {
    return this.adapter.request('DELETE', `orders/${orderId}/rating`);
  }
}
