export default class Locations {
  constructor(Fetcher) {
    super(apiBase);
  }

  show(locationId) {
    return this.request('GET', `/locations/${locationId}`);
  }

  index() {
    return this.request('GET', `/locations`) 
  }
}
