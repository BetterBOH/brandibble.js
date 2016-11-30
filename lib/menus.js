export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type='delivery', date=new Date()) {
    let requested_at = `${date.toISOString().split('.')[0]}Z`;
    return this.adapter.request('POST', `menus`, { location_id, service_type, requested_at });
  }
}
