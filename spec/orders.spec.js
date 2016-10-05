import { shouldSucceed, shouldError, TestingUser, configureTestingOrder } from './helpers';

describe('Orders', () => {
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

  it('an authenticated client can submit an order', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let customer = shouldSucceed(response);
      Brandibble.addresses.all().then(response => {
        let address = shouldSucceed(response)[0];
        // TODO: We should use stored cards in this test eventually
        let card = {
          cc_expiration: '0130',
          cc_number: Brandibble.TestCreditCards.visa[0].number,
          cc_zip: 12345,
          cc_cvv: 123
        };
        return configureTestingOrder(Brandibble, customer, address)
          .then(testingOrder => Brandibble.orders.submit(testingOrder, "credit", card))
          .then(response => {
            expect(response).to.be.true
            done();
          });
      });
    });
  });
});
