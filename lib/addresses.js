'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Addresses = function () {
  function Addresses(adapter) {
    (0, _classCallCheck3.default)(this, Addresses);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Addresses, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/addresses');
    }
  }, {
    key: 'create',
    value: function create(body) {
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/addresses', body);
    }
  }, {
    key: 'delete',
    value: function _delete(customerAddressId) {
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/addresses/' + customerAddressId);
    }
  }]);
  return Addresses;
}();

exports.default = Addresses;