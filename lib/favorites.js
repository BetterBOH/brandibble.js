'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.find');

var _lodash2 = _interopRequireDefault(_lodash);

var _lineItem = require('./models/lineItem');

var _lineItem2 = _interopRequireDefault(_lineItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Favorites = function () {
  function Favorites(adapter) {
    (0, _classCallCheck3.default)(this, Favorites);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Favorites, [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan() {
      var _constructor;

      return (_constructor = this.constructor).buildLineItemOrphan.apply(_constructor, arguments);
    }
  }, {
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/favorites');
    }
  }, {
    key: 'create',
    value: function create() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var lineItemObj = arguments[1];

      var data = {
        name: name,
        menu_item_json: lineItemObj.formatForFavorites()
      };
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }, {
    key: 'update',
    value: function update(favId) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var lineItemObj = arguments[2];

      var data = {
        favorite_item_id: favId,
        name: name,
        menu_item_json: lineItemObj.formatForFavorites()
      };
      return this.adapter.request('PUT', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }, {
    key: 'delete',
    value: function _delete(favId) {
      var data = { favorite_item_id: favId };
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/favorites', data);
    }
  }], [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan(favorite, menuJSON) {
      var menuSection = (0, _lodash2.default)(menuJSON, function (m) {
        return (0, _lodash2.default)(m.children, function (c) {
          return (0, _lodash2.default)(c.items, function (i) {
            return i.id === favorite.menu_item_id;
          });
        });
      });
      if (!menuSection) return;
      var menuChild = (0, _lodash2.default)(menuSection.children, function (c) {
        return (0, _lodash2.default)(c.items, function (i) {
          return i.id === favorite.menu_item_id;
        });
      });
      var product = (0, _lodash2.default)(menuChild.items, function (i) {
        return i.id === favorite.menu_item_id;
      });
      var lineItem = new _lineItem2.default(product);
      try {
        (favorite.menu_item_json[0].option_groups || []).forEach(function (fog) {
          var optionGroup = (0, _lodash2.default)(product.option_groups, function (og) {
            return og.id === fog.id;
          });
          if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
          fog.option_items.forEach(function (foi) {
            var optionItem = (0, _lodash2.default)(optionGroup.option_items, function (oi) {
              return oi.id === foi.id;
            });
            if (!optionItem) throw new Error({ message: 'Option Item Missing' });
            lineItem.addOption(optionGroup, optionItem);
          });
        });
      } catch (e) {
        return;
      }
      return lineItem;
    }
  }]);
  return Favorites;
}();

exports.default = Favorites;