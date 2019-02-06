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

  show(locationId, lat, lng, serviceType, requestedAt, includeTimes) {
    /**
     * If the second arg passed in (lat) is an object
     * we can assume a queryObject was passed (preferred)
     * over a set of query params as separate arguments.
     * This allows us to be backwards compatible, by supporting
     * the latter while supporting the preferred query object
     */
    let queryParamObject;
    if (lat && typeof lat === 'object') {
      queryParamObject = lat;
    } else {
      queryParamObject = Object.assign(
        {},
        !!lat && { latitude: lat },
        !!lng && { longitude: lng },
        !!serviceType && { service_type: serviceType },
        !!requestedAt && { requested_at: coerceDateToISO8601(requestedAt) },
        !!includeTimes && { include_times: includeTimes },
      );
    }

    const queryStringBase = `locations/${locationId}`;
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
