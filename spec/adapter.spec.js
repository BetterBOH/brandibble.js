import { seedEmail, UnsecureApiKey, configureTestingOrder } from './helpers';

describe('Adapter', () => {
  beforeEach(done => {
    Brandibble.adapter.flushAll().then(done);
  });

  it('builds the correct headers', () => {
    let headers = Brandibble.adapter.headers();
    expect(headers).to.have.property('Content-Type', 'application/json');
    expect(headers).to.have.property('Brandibble-Api-Key', UnsecureApiKey);
  });

  it('can persist currentOrder to localStorage', done => {
    configureTestingOrder(Brandibble).then(order => {
      Brandibble.adapter.persistCurrentOrder(order).then(savedOrder => {
        expect(order).to.equal(savedOrder);
        expect(savedOrder).to.be.an.instanceof(Brandibble.Order);
        done();
      });
    }).catch(error => console.log(error));
  })

  it('can restore currentOrder from localStorage', done => {
    configureTestingOrder(Brandibble).then(order => {
      Brandibble.adapter.persistCurrentOrder(order).then(() => {
        Brandibble.adapter.restoreCurrentOrder().then(retrievedOrder => {
          expect(order).to.deep.equal(retrievedOrder);
          expect(retrievedOrder).to.be.an.instanceof(Brandibble.Order);
          done();
        });
      });
    }).catch(error => console.log(error));
  })
});
