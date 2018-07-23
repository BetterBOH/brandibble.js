/* global expect */

import find from 'lodash.find';
import includes from 'lodash.includes';
import { PaymentTypes } from '../lib/utils';

export const TestingUser = {
  first_name: 'Sanctuary',
  last_name: 'Testing',
  email: 'sanctuary-testing-customer@example.com',
  password: 'password',
};

// This user record is only used in the Customers.spec.js for requesting orders
// as the main test customer has so many records the test bombs out.
export const OrdersTestingUser = {
  first_name: 'Sanctuary',
  last_name: 'Testing',
  email: 'sanctuary-orders-testing-customer@example.com',
  password: 'password',
};

export const TestingAddress = {
  street_address: '123 Street St',
  unit: '4 FL',
  city: 'New York',
  state_code: 'NY',
  zip_code: 10013,
  latitude: 40.755912,
  longitude: -73.9709333,
  company: 'Sanctuary Computer, Inc.',
  contact_name: 'Hugh Francis',
  contact_phone: '5512213610',
};

export const UnsecureApiKey = process.env.BRANDIBBLE_API_KEY;

export function seedEmail() {
  return `sanctuary-testing-${(new Date()).valueOf().toString()}@example.com`;
}


export function seedText() {
  return `Testing ${(new Date()).valueOf().toString()}`;
}

export function shouldSucceed(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('data');
  return response.data;
}

export function shouldError(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('errors');
  return response.errors;
}

export async function configureTestingOrder(Brandibble, customer, address, cardOrCashTip) {
  let response = await Brandibble.locations.index();
  let data = shouldSucceed(response);
  expect(data).to.be.a('array');

  const serviceType = 'pickup';
  const location = data[0];
  expect(location.name).to.equal('Madison Park');

  response = await Brandibble.menus.build(location.location_id, serviceType);
  data = shouldSucceed(response);
  expect(data).to.be.a('object');
  expect(data.menu).to.be.a('array');

  const newOrder = await Brandibble.orders.create(location.location_id, serviceType);

  const market = find(data.menu, item => item.name === 'The Market');
  const marketBowls = find(market.children, item => item.name === 'Marketbowls');
  const product = find(marketBowls.items, item => item.name === 'Charred Chicken Marketbowl');

  const soldOutItemIDs = data.sold_out_items;
  if (includes(soldOutItemIDs, product.id)) {
    throw new Error('BrandibbleBackendConfig: Charred Chicken Marketbowl is Sold Out, tests can not run.');
  }

  const lineItem = await newOrder.addLineItem(product, 1);

  expect(lineItem.product.name).to.equal('Charred Chicken Marketbowl');
  expect(lineItem.isValid()).to.equal(false);
  expect(newOrder.cart.isValid()).to.equal(false);

  const bases = lineItem.optionGroups()[0];
  const sides = lineItem.optionGroups()[1];

  /* Load Available Sides & Bases */
  const firstAvailableBase = find(bases.option_items, item => !includes(soldOutItemIDs, item.id));
  const firstAvailableSide = find(sides.option_items, item => !includes(soldOutItemIDs, item.id));
  const secondAvailableSide = find(sides.option_items, item => !includes(soldOutItemIDs, item.id) && item.id !== firstAvailableSide.id);

  await Promise.all([
    newOrder.addOptionToLineItem(lineItem, bases, firstAvailableBase),
    newOrder.addOptionToLineItem(lineItem, sides, firstAvailableSide),
    newOrder.addOptionToLineItem(lineItem, sides, secondAvailableSide),
  ]);

  expect(lineItem.isValid()).to.equal(true);
  expect(newOrder.cart.isValid()).to.equal(true);
  const promises = [];

  if (customer) { promises.push(newOrder.setCustomer(customer)); }
  if (address) { promises.push(newOrder.setAddress(address)); }
  if (cardOrCashTip) { promises.push(newOrder.setPaymentMethod(PaymentTypes.CREDIT, cardOrCashTip)); }

  await Promise.all(promises);

  return newOrder;
}
