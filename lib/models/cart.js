'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _lodash = require('lodash.every');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.find');

var _lodash4 = _interopRequireDefault(_lodash3);

var _lodash5 = require('lodash.map');

var _lodash6 = _interopRequireDefault(_lodash5);

var _lodash7 = require('lodash.reject');

var _lodash8 = _interopRequireDefault(_lodash7);

var _lineItem = require('./lineItem');

var _lineItem2 = _interopRequireDefault(_lineItem);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Cart = function () {
  function Cart() {
    (0, _classCallCheck3.default)(this, Cart);

    this.lineItems = [];
  }

  (0, _createClass3.default)(Cart, [{
    key: 'isValid',
    value: function isValid() {
      return (0, _lodash2.default)((0, _lodash6.default)(this.lineItems, function (lineItem) {
        return lineItem.isValid();
      }));
    }
  }, {
    key: 'addLineItem',
    value: function addLineItem(product) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var uuid = arguments[2];

      var lineItem = new _lineItem2.default(product, quantity, uuid);
      this.lineItems.push(lineItem);
      return lineItem;
    }
  }, {
    key: 'addOptionToLineItem',
    value: function addOptionToLineItem(lineItem, group, item) {
      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.addOption(group, item);
      }
      return false;
    }
  }, {
    key: 'removeOptionFromLineItem',
    value: function removeOptionFromLineItem(lineItem, item) {
      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.removeOption(item);
      }
      return false;
    }
  }, {
    key: 'getLineItemQuantity',
    value: function getLineItemQuantity(lineItem) {
      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        return match.quantity;
      }
      return 0;
    }
  }, {
    key: 'setLineItemMadeFor',
    value: function setLineItemMadeFor(lineItem) {
      var madeFor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.madeFor = madeFor;return madeFor;
      }
      return false;
    }
  }, {
    key: 'setLineItemInstructions',
    value: function setLineItemInstructions(lineItem) {
      var instructions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.instructions = instructions;return instructions;
      }
      return false;
    }
  }, {
    key: 'setLineItemQuantity',
    value: function setLineItemQuantity(lineItem) {
      var quantity = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      var match = (0, _lodash4.default)(this.lineItems, { uuid: lineItem.uuid });
      if (match) {
        match.quantity = quantity;return quantity;
      }
      return false;
    }
  }, {
    key: 'removeLineItem',
    value: function removeLineItem(lineItem) {
      this.lineItems = (0, _lodash8.default)(this.lineItems, { uuid: lineItem.uuid });
      return this.lineItems;
    }
  }, {
    key: 'format',
    value: function format() {
      return (0, _lodash6.default)(this.lineItems, function (lineItem) {
        return lineItem.format();
      });
    }
  }]);
  return Cart;
}();

exports.default = Cart;