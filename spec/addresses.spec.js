/* global Brandibble expect it describe beforeEach */
import { shouldSucceed, shouldError, TestingUser } from './helpers';

describe('Addresses', () => {
  beforeEach(() => {
    return Brandibble.customers.invalidate();
  });

  it('exists', () => expect(Brandibble.addresses).to.exist);

  it('can show all addresses for a customer', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.addresses.all().then((res) => {
        const data = shouldSucceed(res);
        expect(data).to.be.a('array');
      });
    });
  });

  it('can delete an existing address', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.addresses.create({
        street_address: '69 Street St',
        unit: '1 FL',
        city: 'New York',
        state_code: 'NY',
        zip_code: 10013,
        latitude: 40.755912,
        longitude: -73.9709333,
        company: 'Hello Computer',
        contact_name: 'Steve Francis',
        contact_phone: '5512213610',
      }).then((res) => {
        const addressToDelete = res.data[0];
        const { customer_address_id } = addressToDelete;
        return Brandibble.addresses.delete(customer_address_id).then((r) => {
          expect(r).to.be.true;
        });
      });
    });
  });

  it('will fail when there is no current customer', () => {
    return Brandibble.addresses.all().catch((response) => {
      const errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(1);
      expect(errors[0]).to.have.property('code', 'customer_token.missing');
    });
  });

  it('will fail when requesting a different customer to the current', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.adapter.request('GET', 'customers/1/addresses').catch((res) => {
        const errors = shouldError(res);
        expect(errors).to.be.a('array').to.have.lengthOf(1);
      });
    });
  });


  it('can create a new address for a customer', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.addresses.create({
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
      }).then((res) => {
        const data = shouldSucceed(res);
        expect(data).to.be.a('array');
      });
    });
  });
});
