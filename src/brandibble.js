import Adapter from './adapter';
import Events from './events';
import Customers from './customers';
import Locations from './locations';
import Addresses from './addresses';
import Menus from './menus';
import Orders from './orders';
import Payments from './payments';
import Allergens from './allergens';
import Favorites from './favorites';
import Ratings from './ratings';
import Images from './images';

import Order from './models/order';
import LineItem from './models/lineItem';

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
  constructor({ apiKey, brandId, apiEndpoint = null, apiVersion = null, origin = null, storage = null, requestTimeout = null }) {
    if (!apiKey) { throw new Error('Brandibble.js: Please pass apiKey to the constructor options.'); }
    if (!brandId) { throw new Error('Brandibble.js: Please pass brandId to the constructor options.'); }

    const _apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    const _apiVersion = apiVersion || 'v1';
    const _storage = storage || new Storage();
    const _requestTimeout = requestTimeout || false;

    const apiBase = `${_apiEndpoint}${_apiVersion}/brands/${brandId}/`;

    /* Build adapter */
    this.adapter = new Adapter({ apiKey, apiBase, origin, storage: _storage, requestTimeout: _requestTimeout });
    this.events = new Events();

    /* Build Resources */
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter, this.events);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus = new Menus(this.adapter);
    this.orders = new Orders(this.adapter, this.events);
    this.payments = new Payments(this.adapter);
    this.allergens = new Allergens(this.adapter);
    this.favorites = new Favorites(this.adapter);
    this.ratings = new Ratings(this.adapter);
    this.images = new Images(this.adapter);

    /* Misc */
    this.TestCreditCards = TestCreditCards;
  }

  setup() {
    return this.adapter.restoreCustomerToken().then(() => {
      return this.adapter.restoreCurrentOrder().then(() => this);
    });
  }

  /* subject:string:required body:string:required email:string name:string */
  sendSupportTicket(data = {}) {
    return this.adapter.request('POST', 'support_ticket', data);
  }
}
