export default class Locations {
  constructor(adapter) {
    this.adapter = adapter;
  }

  index() {
    return this.adapter.request('GET', `locations`);
  }

  menu(locationId) {
    return this.adapter.request('GET', `locations/${locationId}/menu`);
  }
}
