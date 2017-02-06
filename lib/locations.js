export default class Locations {
  constructor(adapter) {
    this.adapter = adapter;
  }

  index(lat, lng) {
    if(lat && lng) {
      return this.adapter.request('GET', `locations?latitude=${lat}&longitude=${lng}`);
    }
    return this.adapter.request('GET', `locations`);
  }

  show(locationId, lat, lng) {
    if(lat && lng) {
      return this.adapter.request('GET', `locations/${locationId}?latitude=${lat}&longitude=${lng}`);
    }
    return this.adapter.request('GET', `locations/${locationId}`);
  }
}
