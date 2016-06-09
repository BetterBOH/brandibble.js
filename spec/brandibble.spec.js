import { expect } from 'chai';
import Brandibble from '..';

// Test Helpers
function seedEmail() {
  return `sanctuary-testing-${Math.floor(Math.random()*90+10)}@example.com`;
}

// Init Brandibble Session for Testing
var BrandibbleRef = new Brandibble({
  apiKey: 'c2FuY3R1YXJ5IGNvbXB1dGVy',
  brandId: 6,
  apiEndpoint: 'http://unsecure.brandibble.co/api/'
});

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(BrandibbleRef).to.exist);

  it('sets private variables', () => {
    expect(BrandibbleRef).to.have.property('Adapter');
    let Adapter = BrandibbleRef.Adapter;
    expect(Adapter).to.have.property('apiKey', 'c2FuY3R1YXJ5IGNvbXB1dGVy');
    expect(Adapter).to.have.property('apiBase', 'http://unsecure.brandibble.co/api/v1/brands/6/');
  });
});

describe('Brandibble.Adapter', () => {
  it('builds the correct headers', () => {
    let headers = BrandibbleRef.Adapter.headers();
    expect(headers).to.have.property('Content-Type', 'application/json');
    expect(headers).to.have.property('Brandibble-Api-Key', 'c2FuY3R1YXJ5IGNvbXB1dGVy');
  });
});

// Customers
describe('Brandibble.Customers', () => {
  it('exists', () => { expect(BrandibbleRef.Customers).to.exist });

  //it('stores the customer token', () => { expect(BrandibbleInstance.Customers.customerToken).to.exist });
  
  it('can create a customer', done => {
    BrandibbleRef.Customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: seedEmail(),
      password: 'password'
    }).then(response => {
      expect(response).to.be.a('object');
      expect(response).to.have.property('customer_id');
      expect(response).to.have.property('email');
      expect(response).to.have.property('first_name');
      expect(response).to.have.property('last_name');
      expect(response).to.have.property('phone');
      done();
    });
  });

  it('fails with bad inputs', done => {
    BrandibbleRef.Customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: 'nope',
      password: 'password'
    }).catch(error => {
      // TODO
      done();
    });
  });
});

/* Locations
describe('Brandibble.Locations', () => {
  it('exists', () => { expect(BrandibbleInstance.Locations).to.exist });
});
*/
