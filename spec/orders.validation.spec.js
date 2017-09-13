/* global Brandibble expect it describe */
import {
  shouldSucceed,
  shouldError,
  configureTestingOrder,
  TestingUser,
} from './helpers';

describe('Orders Validate', () => {
  it('exists', () => expect(Brandibble.orders).to.exist);

  it('can validate a cart', () => {
    return configureTestingOrder(Brandibble).then((newOrder) => {
      return Brandibble.orders.validateCart(newOrder).then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.a('object');
      });
    });
  });

  it('will throw when validating an invalid cart location change', () => {
    return configureTestingOrder(Brandibble).then((newOrder) => {
      // Location 19 is Hudson Square, whereas the Testing Order uses Location 15
      return Brandibble.orders.validateCart(newOrder, { location_id: 19 }).catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.be.a('array');
        expect(errors[0].code).to.equal('orders.validate.invalid_items');
      });
    });
  });

  it('can validate an order', async () => {
    const { email, password } = TestingUser;

    let response = await Brandibble.customers.authenticate({ email, password });
    const customer = shouldSucceed(response);

    response = await Brandibble.addresses.all();
    const address = shouldSucceed(response)[0];

    // TODO: We should use stored cards in this test eventually
    const card = {
      cc_expiration: '0130',
      cc_number: Brandibble.TestCreditCards.visa[0].number,
      cc_zip: 12345,
      cc_cvv: 123,
    };

    const newOrder = await configureTestingOrder(Brandibble, customer, address, card);
    response = await Brandibble.orders.validate(newOrder);

    shouldSucceed(response);
  });

  it('can validate a pickup order without a customer address', async () => {
    const { email, password } = TestingUser;

    let response = await Brandibble.customers.authenticate({ email, password });
    const customer = shouldSucceed(response);

    // TODO: We should use stored cards in this test eventually
    const card = {
      cc_expiration: '0130',
      cc_number: Brandibble.TestCreditCards.visa[0].number,
      cc_zip: 12345,
      cc_cvv: 123,
    };

    const newOrder = await configureTestingOrder(Brandibble, customer, null, card);
    response = await Brandibble.orders.validate(newOrder);

    shouldSucceed(response);
  });
});
