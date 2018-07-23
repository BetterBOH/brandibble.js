import validate from 'validate.js';
import { ISO8601_PATTERN } from './utils';

export default class Menus {
  constructor(adapter) {
    this.adapter = adapter;
  }

  build(location_id, service_type = 'delivery', date = new Date()) {
    const isISOString = validate({ timestamp: date }, { timestamp: { format: ISO8601_PATTERN } });
    const requested_at = isISOString ? `${date.toISOString().split('.')[0]}Z` : date;
    return this.adapter.request('POST', 'menus', { location_id, service_type, requested_at });
  }

  display(location_id, service_type = 'delivery', date = new Date()) {
    const isISOString = validate({ timestamp: date }, { timestamp: { format: ISO8601_PATTERN } });
    const requested_at = isISOString ? `${date.toISOString().split('.')[0]}Z` : date;
    return this.adapter.request('POST', 'menus/display', { location_id, service_type, requested_at });
  }
}
