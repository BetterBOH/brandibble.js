export default class Favorites {
  constructor(adapter) {
    this.adapter = adapter;
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
