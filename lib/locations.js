'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Locations = function () {
  function Locations(adapter) {
    (0, _classCallCheck3.default)(this, Locations);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Locations, [{
    key: 'index',
    value: function index(queryParamObject) {
      if (queryParamObject) {
        return this.adapter.request('GET', 'locations?' + (0, _utils.queryStringBuilder)(queryParamObject));
      }
      return this.adapter.request('GET', 'locations');
    }
  }, {
    key: 'show',
    value: function show(locationId, lat, lng) {
      if (lat && lng) {
        return this.adapter.request('GET', 'locations/' + locationId + '?latitude=' + lat + '&longitude=' + lng);
      }
      return this.adapter.request('GET', 'locations/' + locationId);
    }
  }, {
    key: 'waitTimes',
    value: function waitTimes(locationId) {
      return this.adapter.request('GET', 'locations/' + locationId + '/wait_times');
    }
  }]);
  return Locations;
}();

exports.default = Locations;