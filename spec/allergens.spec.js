/* global Brandibble expect it describe before */
import { shouldSucceed, TestingUser } from './helpers';

describe('Allergens', () => {
  it('exists', () => expect(Brandibble.allergens).to.exist);

  it('can show all allergens', () => {
    return Brandibble.allergens.all().then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  describe('customer actions', () => {
    let allergens;

    before(() => {
      const { email, password } = TestingUser;
      return Brandibble.customers.authenticate({
        email,
        password,
      }).then(() => {
        return Brandibble.allergens.all().then(({ data }) => {
          allergens = data;
        });
      });
    });

    describe('adding allergens', () => {
      let added;

      before(() => {
        return Brandibble.allergens.create([allergens[0].name]).then(({ data }) => {
          added = data.added[0];
        });
      });

      it('should add customer allergen', () => {
        expect(added).to.equal(allergens[0].name);
      });

      describe('removing allergens', () => {
        let removed;

        before(() => {
          return Brandibble.allergens.remove([added]).then(({ data }) => {
            removed = data.removed[0];
          });
        });

        it('should remove customer allergen', () => {
          expect(removed).to.equal(allergens[0].name);
        });
      });
    });
  });
});
