import Adapter from 'brandibble/adapter';
import Customers from 'brandibble/customers';
import Locations from 'brandibble/locations';
import Addresses from 'brandibble/addresses';
import Menus from 'brandibble/menus';
import Orders from 'brandibble/orders';
import Payments from 'brandibble/payments';
import Allergens from 'brandibble/allergens';
import Favorites from 'brandibble/favorites';

import Order from 'brandibble/models/order';
import LineItem from 'brandibble/models/lineItem';

import { applyPollyfills, TestCreditCards } from './utils';

applyPollyfills();

class Storage {
  config() { return this; }
  static setItem() { return Promise.resolve(); }
  static getItem() { return Promise.resolve(); }
  static removeItem() { return Promise.resolve(); }
  static clear() { return Promise.resolve(); }
}

export default class Brandibble {
  constructor({ apiKey, brandId, apiEndpoint = null, apiVersion = null, origin = null, storage = null }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    const _apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    const _apiVersion = apiVersion || 'v1';
    const _storage = storage || new Storage();

    const apiBase = `${_apiEndpoint}${_apiVersion}/brands/${brandId}/`;

    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase, origin, storage: _storage });

    /* Build Resources */
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus = new Menus(this.adapter);
    this.orders = new Orders(this.adapter);
    this.payments = new Payments(this.adapter);
    this.allergens = new Allergens(this.adapter);
    this.favorites = new Favorites(this.adapter);

    /* Misc */
    this.TestCreditCards = TestCreditCards;
  }

  setup() {
    return this.adapter.restoreCustomerToken().then(() => {
      return this.adapter.restoreCurrentOrder().then(() => this);
    });
  }
}
