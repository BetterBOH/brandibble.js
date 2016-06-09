import Adapter from './Adapter';
import Customers from './Customers';
//import Locations from './Locations';

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint, apiVersion }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    apiVersion  = apiVersion || 'v1';

    let apiBase = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;

    this.Adapter = new Adapter({ apiKey, apiBase });
    this.Customers = new Customers(this.Adapter);
  }
}
