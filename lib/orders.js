'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.find');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.reduce');

var _lodash4 = _interopRequireDefault(_lodash3);

var _order = require('./models/order');

var _order2 = _interopRequireDefault(_order);

var _lineItem = require('./models/lineItem');

var _lineItem2 = _interopRequireDefault(_lineItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Orders = function () {
  function Orders(adapter, events) {
    (0, _classCallCheck3.default)(this, Orders);

    this.adapter = adapter;
    this.events = events;
  }

  (0, _createClass3.default)(Orders, [{
    key: 'create',
    value: function create(locationId, serviceType, paymentType, miscOptions) {
      var order = new _order2.default(this.adapter, locationId, serviceType, paymentType, miscOptions);
      return this.adapter.persistCurrentOrder(order);
    }
  }, {
    key: 'current',
    value: function current() {
      return this.adapter.currentOrder;
    }
  }, {
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan() {
      var _constructor;

      return (_constructor = this.constructor).buildLineItemOrphan.apply(_constructor, arguments);
    }
  }, {
    key: 'validateCart',


    /* The only attrs testChanges accepts are location_id, service_type & requested_at  */
    value: function validateCart(orderObj) {
      var testChanges = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var body = orderObj.formatForValidation();
      (0, _assign2.default)(body, testChanges);
      return this.adapter.request('POST', 'cart/validate', body);
    }
  }, {
    key: 'validate',
    value: function validate(orderObj) {
      var body = orderObj.format();
      return this.adapter.request('POST', 'orders/validate', body);
    }
  }, {
    key: 'submit',
    value: function submit(orderObj) {
      var body = orderObj.format();
      var promise = this.adapter.request('POST', 'orders/create', body);
      this.events.triggerAsync('orders.submit', promise);
      return promise;
    }
  }], [{
    key: 'buildLineItemOrphan',
    value: function buildLineItemOrphan(item, menuJSON) {
      var sections = (0, _lodash4.default)(menuJSON || [], function (combined, section) {
        return [].concat((0, _toConsumableArray3.default)(combined), (0, _toConsumableArray3.default)(section.children), (0, _toConsumableArray3.default)(section.items));
      }, []);

      if (!sections || sections && !sections.length) return;

      var product = (0, _lodash2.default)(sections, function (i) {
        return i.id === item.id;
      });
      var lineItem = new _lineItem2.default(product);

      try {
        (item.option_groups || []).forEach(function (iog) {
          var optionGroup = (0, _lodash2.default)(product.option_groups, function (og) {
            return og.id === iog.id;
          });
          if (!optionGroup) throw new Error({ message: 'Option Group Missing' });
          iog.option_items.forEach(function (foi) {
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
  return Orders;
}();

exports.default = Orders;