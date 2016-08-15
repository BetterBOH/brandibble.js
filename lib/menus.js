export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type='delivery') {
    let requested_at = `${new Date().toISOString().split('.')[0]}Z`;
    return this.adapter.request('POST', `menus`, { location_id, service_type, requested_at });
  }
}
