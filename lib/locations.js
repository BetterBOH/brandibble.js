import { queryStringBuilder } from 'brandibble/utils';

export default class Locations {
  constructor(adapter) {
    this.adapter = adapter;
  }

  index(queryParamObject) {
    if (queryParamObject) {
      return this.adapter.request('GET', `locations?${queryStringBuilder(queryParamObject)}`);
    }
    return this.adapter.request('GET', 'locations');
  }

  show(locationId, lat, lng) {
    if (lat && lng) {
      return this.adapter.request('GET', `locations/${locationId}?latitude=${lat}&longitude=${lng}`);
    }
    return this.adapter.request('GET', `locations/${locationId}`);
  }
}
