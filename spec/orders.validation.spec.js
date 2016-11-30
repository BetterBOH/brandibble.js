import { shouldSucceed, shouldError, TestingUser, configureTestingOrder } from './helpers';

describe('Orders Validate', () => {
  it('exists', done => {
    expect(Brandibble.orders).to.exist;
    done();
  });

  it('can validate an order', done => {
    configureTestingOrder(Brandibble).then(newOrder => {
      Brandibble.orders.validate(newOrder).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('object');
        done();
      });
    });
  });

  it('will throw when validating an invalid order location change', done => {
    configureTestingOrder(Brandibble).then(newOrder => {
      // Location 19 is Hudson Square, whereas the Testing Order uses Location 15
      Brandibble.orders.validate(newOrder, { location_id: 19 }).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.be.a('array');
        expect(errors[0].code).to.equal("orders.validate.invalid_items");
        done();
      });
    });
  });
});
