'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Payments = function () {
  function Payments(adapter) {
    (0, _classCallCheck3.default)(this, Payments);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Payments, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'customers/' + this.adapter.customerId() + '/cards');
    }
  }, {
    key: 'create',
    value: function create(body) {
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/cards', body);
    }
  }, {
    key: 'setDefault',
    value: function setDefault(customerCardId) {
      return this.adapter.request('PUT', 'customers/' + this.adapter.customerId() + '/cards/' + customerCardId);
    }
  }, {
    key: 'delete',
    value: function _delete(customerCardId) {
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/cards/' + customerCardId);
    }
  }]);
  return Payments;
}();

exports.default = Payments;