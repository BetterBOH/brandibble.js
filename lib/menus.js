import { ISO8601Now } from './utils';

export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type='delivery', requested_at=ISO8601Now()) {
    return this.adapter.request('POST', `menus`, { location_id, service_type, requested_at });
  }
}
