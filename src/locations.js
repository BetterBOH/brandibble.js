import { queryStringBuilder, coerceDateToISO8601 } from './utils';

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
    let formattedRequestedAt;

    if (requestedAt) {
      formattedRequestedAt = coerceDateToISO8601(requestedAt);
    }

    const queryStringBase = `locations/${locationId}`;
    const queryParamObject = Object.assign(
      {},
      !!lat && { latitude: lat },
      !!lng && { longitude: lng },
      !!serviceType && { service_type: serviceType },
      !!formattedRequestedAt && { requested_at: formattedRequestedAt },
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
