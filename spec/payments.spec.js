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

  it('can create a new payment for a customer', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.payments.create({
        'cc_number': 4788250000121443,
        'cc_expiration': 1018,
        'cc_cvv': 740,
        'cc_zip': 10022
      }).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

  it('will fail when if the card number does not have 15 or 16 numbers', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.payments.create({
        'cc_number': 478,
        'cc_expiration': 1018,
        'cc_cvv': 740,
        'cc_zip': 10022
      }).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array').to.have.lengthOf(2);
        expect(errors[0]).to.have.property('code', 'customers.cards.add.invalid_card');
        done();
      });
    });
  });

  it('can set a new default card', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      Brandibble.payments.all().then(response => {
        let notDefault = response.data.filter(card => card.is_default === false)[0];
        let { customer_card_id } = notDefault;
        Brandibble.payments.setDefault(customer_card_id).then(response => {
          expect(response).to.be.true;
          done();
        });
      });
    });
  });

  it('will fail when an invalid card id is passed to setDefault', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let data = shouldSucceed(response);
      let badId = 'hfg7d8fh';
      Brandibble.payments.setDefault(badId).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array').to.have.lengthOf(2);
        expect(errors[0]).to.have.property('code', 'customers.cards.update.invalid_id');
        done();
      });
    });
  });

});
