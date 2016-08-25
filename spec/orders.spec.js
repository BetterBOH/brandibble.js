import { buildRef, shouldSucceed, shouldError, TestingUser } from './helpers';
let Brandibble = buildRef();

function configureTestingOrder(customer, address, card) {
  return Brandibble.locations.index().then(response => {
    let data = shouldSucceed(response);
    expect(data).to.be.a('array');

    let serviceType = 'pickup';
    let location = data[0];
    expect(location.name).to.equal('Columbia');

    return Brandibble.menus.build(location.location_id, serviceType).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('object');
      expect(data.menu).to.be.a('array');

      let newOrder = new Brandibble.Order(location, serviceType);
      let product  = data.menu[0].children[0].items[0];
      let lineItem = newOrder.cart.addLineItem(product, 1);

      expect(lineItem.product.name).to.equal('Charred Chicken');
      expect(lineItem.isValid()).to.equal(false);
      expect(newOrder.cart.isValid()).to.equal(false);

      let bases = lineItem.optionGroups()[0];
      let sides = lineItem.optionGroups()[1];

      lineItem.addOption(bases, bases.option_items[0])
      lineItem.addOption(sides, sides.option_items[0])

      expect(lineItem.isValid()).to.equal(true);
      expect(newOrder.cart.isValid()).to.equal(true);

      if (customer) { newOrder.setCustomer(customer); }
      if (address) { newOrder.setAddress(address); }
      if (card) { newOrder.setCard(card); }
      return newOrder;
    });
  });
}

describe('Orders', () => {
  it('exists', () => { expect(Brandibble.orders).to.exist });

  it('can validate an order', done => {
    configureTestingOrder().then(newOrder => {
      Brandibble.orders.validate(newOrder).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('object');
        done();
      }).catch(error => console.log(error));
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
          expiration: '0130',
          card_number: Brandibble.TestCreditCards.visa[0].number,
          zip_code: 12345,
          cvv: 123
        };
        return configureTestingOrder(customer, address, card)
          .then(Brandibble.orders.submit.bind(Brandibble.orders))
          .then(response => {
            expect(response).to.be.true
            done();
          });
      });
    });
  });
});
