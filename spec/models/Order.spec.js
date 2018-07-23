/* global Brandibble expect it describe */
import productJSON from '../stubs/product.stub';
import locationJSON from '../stubs/location.stub';
import menuStub from '../stubs/menu.stub';
import { validFavoriteForOrder } from '../stubs/favorite.stub';
import { TestingAddress } from '../helpers';
import { PaymentTypes } from '../../src/utils';

describe('models/order', () => {
  it('wont allow orders to share the misc object memory allocation', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    const otherNewOrder = new Brandibble.Order(
      Brandibble.adapter,
      locationJSON.location_id,
      'pickup',
    );
    return newOrder.setPromoCode('yolo').then(() => {
      expect(newOrder.miscOptions).to.not.equal(otherNewOrder.miscOptions);
      expect(newOrder.miscOptions.promo_code).to.not.equal(otherNewOrder.miscOptions.promo_code);
    });
  });

  it('can set miscOptions on an order', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    const opts = { notes_for_store: 'Can i get some food?' };
    return newOrder.setMiscOptions(opts).then(() => {
      expect(newOrder.miscOptions.notes_for_store).to.equal(opts.notes_for_store);
    });
  });

  it('can flag a wantsFutureOrder', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.setRequestedAt('2017-06-21T16:09:49Z', true);
    expect(newOrder.wantsFutureOrder).to.be.true;
  });

  it('will throw if wantsFutureOrder is not a bool', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    expect(() => newOrder.setRequestedAt('2017-06-21T16:09:49Z', 'true')).to.throw;
  });

  it('will throw when setting wantsFutureOrder and asap', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    expect(() => newOrder.setRequestedAt('asap', true)).to.throw;
  });

  it('can add a LineItem', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    newOrder.addLineItem(productJSON);
    expect(newOrder.cart.lineItems).to.have.lengthOf(1);
  });

  it('can get quantity', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.addLineItem(productJSON, 3).then((lineItem) => {
      expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
    });
  });

  it('can set quantity', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.addLineItem(productJSON, 1).then((lineItem) => {
      expect(newOrder.getLineItemQuantity(lineItem)).to.equal(1);
      return newOrder
        .setLineItemQuantity(lineItem, 3)
        .then(() => {
          expect(newOrder.getLineItemQuantity(lineItem)).to.equal(3);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  });

  it('can remove a LineItem', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder
      .addLineItem(productJSON)
      .then((lineItem) => {
        expect(newOrder.cart.lineItems).to.have.lengthOf(1);
        return newOrder
          .removeLineItem(lineItem)
          .then(() => {
            expect(newOrder.cart.lineItems).to.have.lengthOf(0);
          })
          .catch(error => console.log(error));
      })
      .catch(error => console.log(error));
  });

  it('does not validate when IDs are passed for customers', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setCustomer({ customer_id: 123 }).then((savedOrder) => {
      expect(savedOrder.customer.customer_id).to.exist;
    });
  });

  it('can set location id', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setLocation(19).then((savedOrder) => {
      expect(savedOrder.locationId).to.equal(19);
    });
  });

  it('can push built line item into cart', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    const lineItemFromFavorite = Brandibble.favorites.buildLineItemOrphan(
      validFavoriteForOrder,
      menuStub,
    );
    return newOrder.pushLineItem(lineItemFromFavorite).then(() => {
      expect(newOrder.cart.lineItems).to.include(lineItemFromFavorite);
    });
  });

  it('returns true for valid request at timestamp', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'delivery');
    const requestedAtTime = `${new Date().toISOString().split('.')[0]}Z`;

    return newOrder.setRequestedAt(requestedAtTime).then(() => {
      expect(newOrder.requestedAt).to.equal(requestedAtTime);
    });
  });

  it('returns errors for invalid request at timestamp', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'delivery');
    const requestedAtTime = new Date();

    return newOrder.setRequestedAt(requestedAtTime).catch((errors) => {
      expect(errors).to.have.keys(['timestamp']);
    });
  });

  it('returns errors for invalid customers', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setCustomer({ invalidKey: 'hi' }).catch((errors) => {
      expect(errors).to.have.keys(['first_name', 'last_name', 'email']);
    });
  });

  it('returns true for valid customers', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    const customer = {
      first_name: 'Hugh',
      last_name: 'Francis',
      email: 'hugh@hugh.co',
      password: 'pizzapasta',
    };
    return newOrder.setCustomer(customer).then(() => {
      expect(newOrder.customer).to.have.keys(['first_name', 'last_name', 'password', 'email']);
    });
  });

  it('does not validate when IDs are passed for address', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setAddress({ customer_address_id: 123 }).then((savedOrder) => {
      expect(savedOrder.address.customer_address_id).to.exist;
    });
  });

  it('returns errors for invalid addresses', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setAddress({ invalidKey: 'hi' }).catch((errors) => {
      expect(errors).to.be.an('object');
    });
  });

  it('returns true for valid addresses', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setAddress(TestingAddress).then(() => {
      expect(newOrder.address).to.deep.equal(TestingAddress);
    });
  });

  it('can set payment method to levelup', () => {
    const newOrder = new Brandibble.Order(Brandibble.adapter, locationJSON.location_id, 'pickup');
    return newOrder.setPaymentMethod(PaymentTypes.LEVELUP).then(() => {
      expect(newOrder.paymentType).to.deep.equal(PaymentTypes.LEVELUP);
    });
  });
});
