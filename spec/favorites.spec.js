/* global Brandibble expect it describe before */
/* eslint no-shadow: 1 */
import productJSON from './stubs/product.stub';
import { TestingUser } from './helpers';

describe('Favorites', () => {
  let lineItem;
  it('exists', () => expect(Brandibble.favorites).to.exist);

  before(() => {
    const { email, password } = TestingUser;
    return Brandibble.customers.authenticate({
      email,
      password,
    }).then(() => {
      lineItem = new Brandibble.LineItem(productJSON, 1);
      const bases = lineItem.optionGroups()[0];
      const sides = lineItem.optionGroups()[1];
      lineItem.addOption(bases, bases.option_items[0]);
      lineItem.addOption(sides, sides.option_items[0]);
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
