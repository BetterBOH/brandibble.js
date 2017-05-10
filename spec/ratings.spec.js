/* global Brandibble expect it describe before window */
import { shouldSucceed, TestingUser, configureTestingOrder } from './helpers';

const TEST_RATING = 3;

describe('Ratings', () => {
  it('exists', () => {
    expect(Brandibble.ratings).to.exist;
  });

  describe('create', () => {
    let orders_id;
    let response;

    before(async () => {
      const { email, password } = TestingUser;
      response = await Brandibble.customers.authenticate({ email, password });
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
      response = await Brandibble.orders.submit(testingOrder);

      orders_id = response.data.orders_id;
      response = await Brandibble.ratings.create(orders_id, { rating: TEST_RATING });
    });

    it('should be able to create a rating for an order', () => {
      expect(response.data.rating).to.equal(TEST_RATING);
    });

    describe('when rating created', () => {
      it('should be able to show rating', async () => {
        response = await Brandibble.ratings.show(orders_id);
        expect(response.data.rating).to.equal(TEST_RATING);
      });

      it('should be able to update rating', async () => {
        response = await Brandibble.ratings.update(orders_id, { rating: TEST_RATING + 1 });
        expect(response.data.rating).to.equal(TEST_RATING + 1);
      });

      it('should be able to delete rating', async () => {
        response = await Brandibble.ratings.delete(orders_id);
        expect(response).to.be.true;
      });
    });
  });
});
