import { applyPollyfills, TestCreditCards } from './utils';
applyPollyfills();

import Adapter from 'brandibble/adapter';
import Customers from 'brandibble/customers';
import Locations from 'brandibble/locations';
import Addresses from 'brandibble/addresses';
import Menus from 'brandibble/menus';
import Orders from 'brandibble/orders';
import Payments from 'brandibble/payments';
import Allergens from 'brandibble/allergens';

import Order from 'brandibble/models/order';
import LineItem from 'brandibble/models/lineItem';

class Storage {
  config(options) { return this; }
  setItem() { return Promise.resolve(); }
  getItem() { return Promise.resolve(); }
  removeItem() { return Promise.resolve(); }
  clear() { return Promise.resolve(); }
}

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint, apiVersion, origin=null, storage }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    apiVersion  = apiVersion || 'v1';
    storage = storage || new Storage();

    let apiBase = `${apiEndpoint}${apiVersion}/brands/${brandId}/`;

    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase, origin, storage });

    /* Build Resources */
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus     = new Menus(this.adapter);
    this.orders    = new Orders(this.adapter);
    this.payments  = new Payments(this.adapter);
    this.allergens = new Allergens(this.adapter);

    /* Misc */
    this.TestCreditCards = TestCreditCards;
  }

  setup() {
    return this.adapter.restoreCustomerToken().then(() => {
      return this.adapter.restoreCurrentOrder().then(() => this)
    });
  }
}
