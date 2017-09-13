/* global Brandibble expect it describe before */
/* eslint no-shadow: 1 */
import productJSON from './stubs/product.stub';
import menuStub from './stubs/menu.stub';
import { validFavoriteForOrder, invalidFavoriteForOrder } from './stubs/favorite.stub';
import { shouldSucceed, TestingUser } from './helpers';

describe('Favorites', () => {
  let lineItem;
  it('exists', () => expect(Brandibble.favorites).to.exist);

  before(() => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then(() => {
      return Brandibble.locations.index().then((res) => {
        let data = shouldSucceed(res);
        return Brandibble.menus.build(data[0].location_id, 'pickup').then((response) => {
          let { menu } = shouldSucceed(response);
          expect(menu).to.be.an('array');
          let product = menu[0].children[0].items[0];
          expect(product.name).to.eq('Charred Chicken Marketbowl');
          lineItem = new Brandibble.LineItem(productJSON, 1);
          const bases = lineItem.optionGroups()[0];
          const sides = lineItem.optionGroups()[1];
          lineItem.addOption(bases, bases.option_items[0]);
          lineItem.addOption(sides, sides.option_items[0]);
          lineItem.addOption(sides, sides.option_items[1]);
        });
      });
    });
  });

  describe('adds favorite', () => {
    let favorite;

    before(() => {
      return Brandibble.favorites.create('my favorite', lineItem).then(({ data }) => {
        favorite = data;
      });
    });

    it('should add customer favorite', () => {
      expect(favorite).to.include.keys('favorite_item_id');
    });
  });

  describe('lists favorites', () => {
    let favorites;

    before(() => {
      return Brandibble.favorites.all().then(({ data }) => {
        favorites = data;
      });
    });

    it('should list all customer favorites', () => {
      expect(favorites).to.be.a('array');
    });

    it('should contain favorite objects', () => {
      expect(favorites[0]).to.include.keys('name', 'favorite_item_id', 'menu_item_json');
    });
  });

  describe('can build line item against valid menu', () => {
    let lineItemFromFavorite;
    before(() => {
      lineItemFromFavorite = Brandibble.favorites.buildLineItemOrphan(validFavoriteForOrder, menuStub);
    });

    it('should be a lineItem object', () => {
      expect(lineItemFromFavorite).to.be.a('object');
    });
  });

  describe('fails to build line item against menu', () => {
    let lineItemFromFavorite;
    before(() => {
      lineItemFromFavorite = Brandibble.favorites.buildLineItemOrphan(invalidFavoriteForOrder, menuStub);
    });

    it('lineItemFromFavorite should be undefined', () => {
      expect(lineItemFromFavorite).to.be.an('undefined');
    });
  });

  describe('updates favorite', () => {
    let favoriteId;
    let updatedFavoriteId;

    before(() => {
      return Brandibble.favorites.all().then(({ data }) => {
        favoriteId = data[0].favorite_item_id;
        return Brandibble.favorites.update(favoriteId, 'new name', lineItem).then(({ data }) => {
          updatedFavoriteId = data.favorite_item_id;
        });
      });
    });

    it('should update first customer favorite', () => {
      expect(updatedFavoriteId).to.equal(favoriteId);
    });
  });

  describe('removes favorite', () => {
    let favoriteId;
    it('removes the first favorite in the list', () => {
      return Brandibble.favorites.all().then(({ data }) => {
        favoriteId = data[0].favorite_item_id;
        return Brandibble.favorites.delete(favoriteId).then((response) => {
          expect(response).to.be.true;
        });
      });
    });
  });
});
