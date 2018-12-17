import { coerceDateToISO8601 } from './utils';

export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type = 'delivery', date = new Date()) {
    const requested_at = coerceDateToISO8601(date);
    return this.adapter.request('POST', 'menus', {
      location_id,
      service_type,
      requested_at,
    });
  }

  display(location_id, service_type = 'delivery', date = new Date()) {
    const requested_at = coerceDateToISO8601(date);
    return this.adapter.request('POST', 'menus/display', {
      location_id,
      service_type,
      requested_at,
    });
  }
}
