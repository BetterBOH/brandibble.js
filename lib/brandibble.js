import { applyPollyfills, TestCreditCards } from './utils';
applyPollyfills();

import Adapter from 'brandibble/adapter';
import Customers from 'brandibble/customers';
import Locations from 'brandibble/locations';
import Addresses from 'brandibble/addresses';
import Menus from 'brandibble/menus';
import Orders from 'brandibble/orders';
import Payments from 'brandibble/payments';

import Order from 'brandibble/models/order';
import LineItem from 'brandibble/models/lineItem';

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
    this.Order = Order;
    this.LineItem = LineItem;

    /* Build Resources */
    this.customers = new Customers(this.adapter);
    this.locations = new Locations(this.adapter);
    this.addresses = new Addresses(this.adapter);
    this.menus     = new Menus(this.adapter);
    this.orders    = new Orders(this.adapter);
    this.payments  = new Payments(this.adapter);

    /* Misc */
    this.TestCreditCards = TestCreditCards;
  }

  setup() {
    return this.adapter.restoreCustomerToken().then(() => {
      return this.adapter.restoreCurrentOrder().then(() => this)
    });
  }
}
