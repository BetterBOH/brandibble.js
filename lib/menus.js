'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _validate = require('validate.js');

var _validate2 = _interopRequireDefault(_validate);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Menus = function () {
  function Menus(adapter) {
    (0, _classCallCheck3.default)(this, Menus);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Menus, [{
    key: 'build',
    value: function build(location_id) {
      var service_type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'delivery';
      var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var isISOString = (0, _validate2.default)({ timestamp: date }, { timestamp: { format: _utils.ISO8601_PATTERN } });
      var requested_at = isISOString ? date.toISOString().split('.')[0] + 'Z' : date;
      return this.adapter.request('POST', 'menus', { location_id: location_id, service_type: service_type, requested_at: requested_at });
    }
  }, {
    key: 'display',
    value: function display(location_id) {
      var service_type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'delivery';
      var date = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Date();

      var isISOString = (0, _validate2.default)({ timestamp: date }, { timestamp: { format: _utils.ISO8601_PATTERN } });
      var requested_at = isISOString ? date.toISOString().split('.')[0] + 'Z' : date;
      return this.adapter.request('POST', 'menus/display', { location_id: location_id, service_type: service_type, requested_at: requested_at });
    }
  }]);
  return Menus;
}();

exports.default = Menus;