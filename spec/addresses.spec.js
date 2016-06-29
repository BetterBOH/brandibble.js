import { retrieve } from '../lib/utils';
import { seedEmail, seedText, buildRef, shouldSucceed, shouldError, TestingUser } from './helpers';
let BrandibbleRef = buildRef();

describe('Addresses', () => {
  beforeEach(done => {
    BrandibbleRef.customers.invalidate().then(() => done());
  });

  it('exists', () => expect(BrandibbleRef.addresses).to.exist);

  it('can show all addresses for a customer', done => {
    const { email, password } = TestingUser;
    BrandibbleRef.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      BrandibbleRef.addresses.all().then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

  it('will fail when there is no current customer', done => {
    BrandibbleRef.addresses.all().catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(1);
      expect(errors[0]).to.have.property('code', 'customer_token.missing');
      done();
    });
  });

  it('will fail when requesting a different customer to the current', done => {
    const { email, password } = TestingUser;
    BrandibbleRef.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      BrandibbleRef.adapter.request('GET', `customers/1/addresses`).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array').to.have.lengthOf(1);
        done();
      });
    });
  });


  it('can create a new address for a customer', done => {
    const { email, password } = TestingUser;
    BrandibbleRef.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      BrandibbleRef.addresses.create({
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
