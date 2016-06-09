export default class Customers {
  constructor(Adapter) {
    this.Adapter = Adapter;
  }

  /* email, password */
  token(body) {
    return this.Adapter.request('POST', 'customers/token', body);
  }
  
  show() {
    return this.Adapter.request('GET', `customers/${this.Adapter.getCustomerId()}`);
  }

  /* first_name, last_name, email, password */
  create(body) {
    return this.Adapter.request('POST', 'customers', body);
  }
  
  update(body) {
    return this.Adapter.request('PUT', 'customers', body);
  }

  forgot() {
    return this.Adapter.request('POST', 'customers/token');
  }
}
