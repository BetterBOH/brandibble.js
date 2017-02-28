/* global Brandibble expect it describe before */
import { shouldSucceed, TestingUser } from './helpers';

describe('Allergens', () => {
  it('exists', () => { expect(Brandibble.allergens).to.exist });

  it('can show all allergens', done => {
    Brandibble.allergens.all().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });

  describe('customer actions', () => {
    let allergens;

    before(done => {
      const { email, password } = TestingUser;
      Brandibble.customers.authenticate({
        email,
        password
      }).then(() => {
        Brandibble.allergens.all().then(({data}) => {
          allergens = data;
          done();
        });
      });
    });

    describe('adding allergens', () => {
      let added;

      before(done => {
        Brandibble.allergens.create([allergens[0].name]).then(({data}) => {
          added = data.added[0];
          done();
        });
      });

      it('should add customer allergen', () => {
        expect(added).to.equal(allergens[0].name);
      });

      describe('removing allergens', () => {
        let removed;

        before(done => {
          Brandibble.allergens.remove([added]).then(({data}) => {
            removed = data.removed[0];
            done();
          });
        });

        it('should remove customer allergen', () => {
          expect(removed).to.equal(allergens[0].name);
        });
      });
    });
  });
});
