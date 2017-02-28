/* global Brandibble expect it describe */
import { shouldSucceed, shouldError, configureTestingOrder } from './helpers';

describe('Orders Validate', () => {
  it('exists', () => expect(Brandibble.orders).to.exist);

  it('can validate an order', () => {
    return configureTestingOrder(Brandibble).then((newOrder) => {
      return Brandibble.orders.validate(newOrder).then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.a('object');
      });
    });
  });

  it('will throw when validating an invalid order location change', () => {
    return configureTestingOrder(Brandibble).then((newOrder) => {
      // Location 19 is Hudson Square, whereas the Testing Order uses Location 15
      return Brandibble.orders.validate(newOrder, { location_id: 19 }).catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.be.a('array');
        expect(errors[0].code).to.equal('orders.validate.invalid_items');
      });
    });
  });
});
