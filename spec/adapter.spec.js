/* global Brandibble expect it describe beforeEach */
import { UnsecureApiKey, configureTestingOrder } from './helpers';

describe('Adapter', () => {
  beforeEach(() => {
    return Brandibble.adapter.flushAll();
  });

  it('builds the correct headers', () => {
    const headers = Brandibble.adapter.headers();
    expect(headers).to.have.property('Content-Type', 'application/json');
    expect(headers).to.have.property('Brandibble-Api-Key', UnsecureApiKey);
  });

  it('throws a detailed exception when JSON parsing fails', () => {
    Brandibble.adapter.apiBase = 'http://httpstat.us/';
    Brandibble.adapter.apiKey = null;
    return Brandibble.adapter.request('GET', '200/cors').catch((error) => {
      Brandibble.adapter.apiBase =
        'https://staging.brandibble.co/api/v1/brands/6/';
      Brandibble.adapter.apiKey = UnsecureApiKey;
      
      expect(error.response).to.present;
      expect(error.exception).to.present;
      expect(error.message).to.present;
      // Ensure we don't double catch ourselves
      expect(error.exception.exception).to.not.present;
    });
  });

  it('can persist currentOrder to localStorage', () => {
    return configureTestingOrder(Brandibble)
      .then((order) => {
        return Brandibble.adapter
          .persistCurrentOrder(order)
          .then((savedOrder) => {
            expect(order).to.equal(savedOrder);
            expect(savedOrder).to.be.an.instanceof(Brandibble.Order);
          });
      })
      .catch(error => console.log(error));
  });

  it('can restore currentOrder from localStorage', () => {
    return configureTestingOrder(Brandibble)
      .then((order) => {
        // This is here for testing that this is properly restored... you'd never set it like this in a real app.
        order.wantsFutureOrder = true;
        return Brandibble.adapter.persistCurrentOrder(order).then(() => {
          return Brandibble.adapter
            .restoreCurrentOrder()
            .then((retrievedOrder) => {
              expect(order).to.deep.equal(retrievedOrder);
              expect(retrievedOrder).to.be.an.instanceof(Brandibble.Order);
            });
        });
      })
      .catch(error => console.log(error));
  });

  it('can restore requestedAt from localStorage', () => {
    return configureTestingOrder(Brandibble)
      .then((order) => {
        const requestedAtTime = `${new Date().toISOString().split('.')[0]}Z`;
        return order.setRequestedAt(requestedAtTime).then(() => {
          return Brandibble.adapter
            .restoreCurrentOrder()
            .then((retrievedOrder) => {
              expect(retrievedOrder.requestedAt).to.equal(requestedAtTime);
            });
        });
      })
      .catch(error => console.log(error));
  });

  it('can will flush lifecycle specific state when flushAll is called', () => {
    return configureTestingOrder(Brandibble)
      .then((order) => {
        expect(Brandibble.adapter.currentOrder).to.equal(order);
        return Brandibble.adapter.flushAll().then(() => {
          expect(Brandibble.adapter.currentOrder).to.be.null;
        });
      })
      .catch(error => console.log(error));
  });

  it('can cut off slow requests based on the timeout property', () => {
    Brandibble.adapter.requestTimeout = 1;
    return Brandibble.locations.index().catch((err) => {
      Brandibble.adapter.requestTimeout = 10000;
      expect(err.message).to.equal(
        'Brandibble.js: The GET request to locations?include_times=true timed out after 1.',
      );
      return true;
    });
  });
});
