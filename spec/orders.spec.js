/* global Brandibble expect it describe beforeEach window */
import { shouldSucceed, TestingUser, configureTestingOrder } from './helpers';

describe('Orders', () => {
  it('exists', done => {
    expect(Brandibble.orders).to.exist;
    done();
  });

  it('an authenticated client can submit an order', function(done) {
    this.timeout(10000);
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
        return configureTestingOrder(Brandibble, customer, address, card)
          .then(testingOrder => Brandibble.orders.submit(testingOrder))
          .then(response => {
            let data = shouldSucceed(response);
            expect(data).to.be.a('object');
            done();
          });
      });
    });
  });


  it('will not restore a credit card submitted in it\'s raw format from local storage', done => {
    const { email, password } = TestingUser;
    Brandibble.customers.authenticate({
      email,
      password
    }).then(response => {
      let customer = shouldSucceed(response);
      Brandibble.addresses.all().then(response => {
        let address = shouldSucceed(response)[0];
        let card = {
          cc_expiration: '0130',
          cc_number: Brandibble.TestCreditCards.visa[0].number,
          cc_zip: 12345,
          cc_cvv: 123
        };
        return configureTestingOrder(Brandibble, customer, address, card).then(order => {
          Brandibble.adapter.persistCurrentOrder(order).then(() => {
            Brandibble.adapter.restoreCurrentOrder().then(retrievedOrder => {
              expect(retrievedOrder.creditCard).to.equal(null);
              expect(retrievedOrder).to.be.an.instanceof(Brandibble.Order);
              done();
            });
          });
        }).catch(error => console.log(error));
      });
    });
  })

});
