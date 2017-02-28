/* global Brandibble expect it describe beforeEach */
import { shouldSucceed, shouldError, TestingUser } from './helpers';

describe('Addresses', () => {
  beforeEach(done => {
    Brandibble.customers.invalidate().then(done);
  });

  it('exists', () => expect(Brandibble.addresses).to.exist);

  it('can show all addresses for a customer', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.addresses.all().then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

  it('can delete an existing address', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.addresses.create({
        street_address: '69 Street St',
        unit: '1 FL',
        city: 'New York',
        state_code: 'NY',
        zip_code: 10013,
        latitude: 40.755912,
        longitude: -73.9709333,
        company: 'Hello Computer',
        contact_name: 'Steve Francis',
        contact_phone: '5512213610'
      }).then(response => {
        let addressToDelete = response.data[0];
        let { customer_address_id } = addressToDelete;
        Brandibble.addresses.delete(customer_address_id).then(response => {
          expect(response).to.be.true;
          done();
        })
      })
    });
  });

  it('will fail when there is no current customer', done => {
    Brandibble.addresses.all().catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(1);
      expect(errors[0]).to.have.property('code', 'customer_token.missing');
      done();
    });
  });

  it('will fail when requesting a different customer to the current', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.adapter.request('GET', `customers/1/addresses`).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array').to.have.lengthOf(1);
        done();
      });
    });
  });


  it('can create a new address for a customer', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.addresses.create({
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
      }).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

});
