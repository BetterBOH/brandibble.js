import { queryStringBuilder } from './utils';

const isArray = obj => (Object.prototype.toString.call(obj) === '[object Array]');

export default class Images {
  constructor(adapter) {
    this.adapter = adapter;
  }

  show(ids, type) {
    const params = {};
    if (typeof ids === 'string') {
      params.ids = ids;
    } else if (isArray(ids)) {
      params.ids = ids.join(',');
    } else {
      params.ids = `${ids}`;
    }
    if (type) params.image_type = type;
    return this.adapter.request('GET', `images?${queryStringBuilder(params)}`);
  }
}
