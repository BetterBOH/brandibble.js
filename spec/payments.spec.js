import { retrieve } from '../lib/utils';
import { seedEmail, seedText, shouldSucceed, shouldError, TestingUser } from './helpers';

describe('Payments', () => {
  beforeEach(done => {
    Brandibble.customers.invalidate().then(done);
  });

  it('exists', () => expect(Brandibble.payments).to.exist);

  it('can show all payment methods for a customer', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.payments.all().then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

  it('will fail when there is no current customer', done => {
    Brandibble.payments.all().catch(response => {
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
      Brandibble.adapter.request('GET', `customers/1/cards`).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array').to.have.lengthOf(1);
        done();
      });
    });
  });

});
