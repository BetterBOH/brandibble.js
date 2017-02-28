/* global expect */
import { PaymentTypes } from '../lib/utils';

export const TestingUser = {
  first_name: 'Sanctuary',
  last_name: 'Testing',
  email: 'sanctuary-testing-customer@example.com',
  password: 'password'
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
  contact_phone: '5512213610'
};

export const UnsecureApiKey = process.env.API_KEY;

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

export function configureTestingOrder(Brandibble, customer, address, cardOrCashTip) {
  return Brandibble.locations.index().then(response => {
    let data = shouldSucceed(response);
    expect(data).to.be.a('array');

    let serviceType = 'pickup';
    let location = data[0];
    expect(location.name).to.equal('Columbia');

    return Brandibble.menus.build(location.location_id, serviceType).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('object');
      expect(data.menu).to.be.a('array');

      return Brandibble.orders.create(location.location_id, serviceType).then(newOrder => {
        let product  = data.menu[0].children[0].items[0];
        return newOrder.addLineItem(product, 1).then(lineItem => {

          expect(lineItem.product.name).to.equal('Charred Chicken');
          expect(lineItem.isValid()).to.equal(false);
          expect(newOrder.cart.isValid()).to.equal(false);

          let bases = lineItem.optionGroups()[0];
          let sides = lineItem.optionGroups()[1];

          return Promise.all([
            newOrder.addOptionToLineItem(lineItem, bases, bases.option_items[0]),
            newOrder.addOptionToLineItem(lineItem, sides, sides.option_items[0])
          ]).then(() => {
            expect(lineItem.isValid()).to.equal(true);
            expect(newOrder.cart.isValid()).to.equal(true);

            let promises = [];

            if (customer) { promises.push(newOrder.setCustomer(customer)); }
            if (address) { promises.push(newOrder.setAddress(address)); }
            if (cardOrCashTip) { promises.push(newOrder.setPaymentMethod(PaymentTypes.CREDIT, cardOrCashTip)); }

            return Promise.all(promises).then(() => newOrder);
          });
        });
      });
    });
  });
}
