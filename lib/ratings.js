'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Ratings = function () {
  function Ratings(adapter) {
    (0, _classCallCheck3.default)(this, Ratings);

    this.adapter = adapter;
  }

  /* rating:integer(1-5):required, comments:string */


  (0, _createClass3.default)(Ratings, [{
    key: 'create',
    value: function create(orderId, body) {
      return this.adapter.request('POST', 'orders/' + orderId + '/rating', body);
    }

    /* rating:integer(1-5):required, comments:string */

  }, {
    key: 'update',
    value: function update(orderId, body) {
      return this.adapter.request('PUT', 'orders/' + orderId + '/rating', body);
    }
  }, {
    key: 'show',
    value: function show(orderId) {
      return this.adapter.request('GET', 'orders/' + orderId + '/rating');
    }
  }, {
    key: 'delete',
    value: function _delete(orderId) {
      return this.adapter.request('DELETE', 'orders/' + orderId + '/rating');
    }
  }]);
  return Ratings;
}();

exports.default = Ratings;