import { shouldSucceed, shouldError } from './helpers';

describe('Allergens', () => {
  it('exists', () => { expect(Brandibble.allergens).to.exist });

  it('can show all allergens', done => {
    Brandibble.allergens.all().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });
});
