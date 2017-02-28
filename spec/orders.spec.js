/* global Brandibble expect it describe beforeEach window */
import { shouldSucceed, TestingUser, configureTestingOrder } from './helpers';

describe('Orders', () => {
  it('exists', () => {
    expect(Brandibble.orders).to.exist;
  });

  it('an authenticated client can submit an order', async function () {
    this.timeout(20000);

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

    const testingOrder = await configureTestingOrder(Brandibble, customer, address, card);
    response = await Brandibble.orders.submit(testingOrder).catch(console.log);

    const data = shouldSucceed(response);
    expect(data).to.be.a('object');
  });

  it('will not restore a credit card submitted in it\'s raw format from local storage', () => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then((response) => {
      const customer = shouldSucceed(response);
      return Brandibble.addresses.all().then((res) => {
        const address = shouldSucceed(res)[0];
        const card = {
          cc_expiration: '0130',
          cc_number: Brandibble.TestCreditCards.visa[0].number,
          cc_zip: 12345,
          cc_cvv: 123,
        };
        return configureTestingOrder(Brandibble, customer, address, card).then((order) => {
          return Brandibble.adapter.persistCurrentOrder(order).then(() => {
            return Brandibble.adapter.restoreCurrentOrder().then((retrievedOrder) => {
              expect(retrievedOrder.creditCard).to.equal(null);
              expect(retrievedOrder).to.be.an.instanceof(Brandibble.Order);
            });
          });
        }).catch(error => console.log(error));
      });
    });
  });
});
