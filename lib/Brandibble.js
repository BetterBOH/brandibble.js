import Adapter from './adapter';
import Customers from './customers';
//import Locations from './Locations';

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint, apiVersion }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    apiVersion  = apiVersion || 'v1';

    let apiBase = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;
   
    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase });

    /* Build Resources */
    this.customers = new Customers(this.adapter);
  }
}
