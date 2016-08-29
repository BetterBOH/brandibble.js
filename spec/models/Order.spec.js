import { buildRef } from './../helpers';
import productJSON from './../product.stub';
import locationJSON from './../location.stub';
let Brandibble = buildRef();

describe('Order', () => {
  it('can add a LineItem', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON);
    expect(newOrder.cart.lineItems).to.have.lengthOf(1);
  });

  it('can get quantity', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    let lineItem = newOrder.addLineItem(productJSON, 3);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
  });

  it('can set quantity', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    let lineItem = newOrder.addLineItem(productJSON, 1);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(1);
    newOrder.setLineItemQuantity(lineItem, 3);
    expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
  });

  it('can remove a LineItem', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON);
    let lineItem = expect(newOrder.cart.lineItems).to.have.lengthOf(1);
    newOrder.removeLineItem(lineItem);
    expect(newOrder.cart.lineItems).to.have.lengthOf(0);
  });

  it('does not validate when IDs are passed for cards', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    expect(newOrder.setCard({customer_card_id: 123})).to.be.true;
  });

  it('returns errors for invalid cards', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    expect(newOrder.setCard({invalidKey: 'hi'})).to.have.keys(['cc_number', 'cc_cvv', 'cc_zip', 'cc_expiration']);
  });

  it('returns true for valid cards', () => {
    let newOrder = new Brandibble.Order(locationJSON.location_id, 'pickup');
    let card = {
      cc_expiration: '0130',
      cc_number: Brandibble.TestCreditCards.visa[0].number,
      cc_zip: 12345,
      cc_cvv: 123
    };
    expect(newOrder.setCard(card)).to.be.true;
  });
});
