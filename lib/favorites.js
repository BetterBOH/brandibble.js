export default class Favorites {
  constructor(adapter) {
    this.adapter = adapter;
  }

  all() {
    return this.adapter.request('GET', `customers/${this.adapter.customerId()}/favorites`);
  }

  create(newFavorite) {
    const data = newFavorite;
    return this.adapter.request('POST', `customers/${this.adapter.customerId()}/favorites`, data);
  }

  update(updatedFavorite) {
    const data = updatedFavorite;
    return this.adapter.request('PUT', `customers/${this.adapter.customerId()}/favorites`, data);
  }

  remove(favoriteItemId) {
    const data = {
      favorite_item_id: favoriteItemId,
    };
    return this.adapter.request('DELETE', `customers/${this.adapter.customerId()}/favorites`, data);
  }
}
