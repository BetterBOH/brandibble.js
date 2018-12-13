import validate from 'validate.js';
import { queryStringBuilder, ISO8601_PATTERN } from './utils';

export default class Locations {
  constructor(adapter) {
    this.adapter = adapter;
  }

  index(queryParamObject) {
    if (queryParamObject) {
      return this.adapter.request(
        'GET',
        `locations?${queryStringBuilder(queryParamObject)}`,
      );
    }
    return this.adapter.request('GET', 'locations');
  }

  show(locationId, lat, lng, serviceType, requestedAt) {
    const isISOString = validate(
      { timestamp: requestedAt },
      { timestamp: { format: ISO8601_PATTERN } },
    );
    const requested_at = isISOString
      ? `${requestedAt.toISOString().split('.')[0]}Z`
      : requestedAt;

    const queryStringBase = `locations/${locationId}`;
    const queryParamObject = Object.assign(
      {},
      !!lat && { latitude: lat },
      !!lng && { longitude: lng },
      !!serviceType && { service_type: serviceType },
      !!requested_at && { requested_at },
    );

    if (Object.keys(queryParamObject).length) {
      return this.adapter.request(
        'GET',
        `${queryStringBase}?${queryStringBuilder(queryParamObject)}`,
      );
    }

    return this.adapter.request('GET', `${queryStringBase}`);
  }

  waitTimes(locationId) {
    return this.adapter.request('GET', `locations/${locationId}/wait_times`);
  }
}
