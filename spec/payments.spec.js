/* global Brandibble expect it describe beforeEach */
import { shouldSucceed, shouldError, TestingUser } from './helpers';

describe('Payments', () => {
  beforeEach(() => Brandibble.customers.invalidate());

  it('exists', () => expect(Brandibble.payments).to.exist);

  it('can show all payment methods for a customer', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.payments.all().then((res) => {
        const data = shouldSucceed(res);
        expect(data).to.be.a('array');
      });
    });
  });

  it('will fail when there is no current customer', () => {
    return Brandibble.payments.all().catch((response) => {
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
      return Brandibble.adapter.request('GET', 'customers/1/cards').catch((res) => {
        const errors = shouldError(res);
        expect(errors).to.be.a('array').to.have.lengthOf(1);
      });
    });
  });

  it('can create a new payment for a customer', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.payments.create({
        cc_number: 4788250000121443,
        cc_expiration: 1018,
        cc_cvv: 740,
        cc_zip: 10022,
      }).then((res) => {
        const data = shouldSucceed(res);
        expect(data).to.be.a('array');
      });
    });
  });

  it('will fail when if the card number does not have 15 or 16 numbers', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.payments.create({
        cc_number: 478,
        cc_expiration: 1018,
        cc_cvv: 740,
        cc_zip: 10022,
      }).catch((res) => {
        const errors = shouldError(res);
        expect(errors).to.be.a('array').to.have.lengthOf(2);
        expect(errors[0]).to.have.property('code', 'customers.cards.add.invalid_card');
      });
    });
  });

  it('can set a new default card', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.payments.all().then((res) => {
        const notDefault = res.data.filter(card => card.is_default === false)[0];
        const { customer_card_id } = notDefault;
        return Brandibble.payments.setDefault(customer_card_id).then((r) => {
          expect(r).to.be.true;
        });
      });
    });
  });

  it('will fail when an invalid card id is passed to setDefault', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      const badId = 'hfg7d8fh';
      return Brandibble.payments.setDefault(badId).catch((res) => {
        const errors = shouldError(res);
        expect(errors).to.be.a('array').to.have.lengthOf(2);
        expect(errors[0]).to.have.property('code', 'customers.cards.update.invalid_id');
      });
    });
  });

  it('can deconste an existing card', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      return Brandibble.payments.all().then((res) => {
        const cardToDelete = res.data[0];
        const { customer_card_id } = cardToDelete;
        return Brandibble.payments.delete(customer_card_id).then((r) => {
          expect(r).to.be.true;
        });
      });
    });
  });

  it('will fail when an invalid card id is passed to delete', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      shouldSucceed(response);
      const badId = 'hfg7d8fh';
      return Brandibble.payments.delete(badId).catch((res) => {
        const errors = shouldError(res);
        expect(errors).to.be.a('array').to.have.lengthOf(2);
        expect(errors[0]).to.have.property('code', 'customers.cards.delete.invalid_id');
      });
    });
  });
});
