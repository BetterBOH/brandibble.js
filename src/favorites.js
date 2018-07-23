import find from 'lodash.find';
import LineItem from './models/lineItem';

export default class Favorites {
  constructor(adapter) {
    this.adapter = adapter;
  }

  buildLineItemOrphan(...args) {
    return this.constructor.buildLineItemOrphan(...args);
  }


  static buildLineItemOrphan(favorite, menuJSON) {
    const menuSection = find(menuJSON, m => find(m.children, c => find(c.items, i => i.id === favorite.menu_item_id)));
    if (!menuSection) return;
    const menuChild = find(menuSection.children, c => find(c.items, i => i.id === favorite.menu_item_id));
    const product = find(menuChild.items, i => i.id === favorite.menu_item_id);
    const lineItem = new LineItem(product);
    try {
      (favorite.menu_item_json[0].option_groups || []).forEach((fog) => {
        const optionGroup = find(product.option_groups, og => og.id === fog.id);
        if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
        fog.option_items.forEach((foi) => {
          const optionItem = find(optionGroup.option_items, oi => oi.id === foi.id);
          if (!optionItem) throw new Error({ message: 'Option Item Missing' });
          lineItem.addOption(optionGroup, optionItem);
        });
      });
    } catch (e) {
      return;
    }
    return lineItem;
  }

  all() {
    return this.adapter.request('GET', `customers/${this.adapter.customerId()}/favorites`);
  }

  create(name = '', lineItemObj) {
    const data = {
      name,
      menu_item_json: lineItemObj.formatForFavorites(),
    };
    return this.adapter.request('POST', `customers/${this.adapter.customerId()}/favorites`, data);
  }

  update(favId, name = '', lineItemObj) {
    const data = {
      favorite_item_id: favId,
      name,
      menu_item_json: lineItemObj.formatForFavorites(),
    };
    return this.adapter.request('PUT', `customers/${this.adapter.customerId()}/favorites`, data);
  }

  delete(favId) {
    const data = { favorite_item_id: favId };
    return this.adapter.request('DELETE', `customers/${this.adapter.customerId()}/favorites`, data);
  }
}
