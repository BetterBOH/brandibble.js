export default class Orders {
  constructor(adapter) {
    this.adapter = adapter;
  }

  validate(orderObj) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    let body = orderObj.formatForValidation();
    body.requested_at = requested_at;
    return this.adapter.request('POST', 'orders/validate', body);
  }

  submit(orderObj) {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    let body = orderObj.format();
    body.requested_at = requested_at;
    return this.adapter.request('POST', 'orders/create', body);
  }
}
