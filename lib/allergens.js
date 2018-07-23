'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Allergens = function () {
  function Allergens(adapter) {
    (0, _classCallCheck3.default)(this, Allergens);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Allergens, [{
    key: 'all',
    value: function all() {
      return this.adapter.request('GET', 'allergens');
    }
  }, {
    key: 'create',
    value: function create(allergensArr) {
      var data = {
        allergens: allergensArr
      };
      return this.adapter.request('POST', 'customers/' + this.adapter.customerId() + '/allergens', data);
    }
  }, {
    key: 'remove',
    value: function remove(allergensArr) {
      var data = {
        allergens: allergensArr
      };
      return this.adapter.request('DELETE', 'customers/' + this.adapter.customerId() + '/allergens', data);
    }
  }]);
  return Allergens;
}();

exports.default = Allergens;