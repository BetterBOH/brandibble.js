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

var isArray = function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

var Images = function () {
  function Images(adapter) {
    (0, _classCallCheck3.default)(this, Images);

    this.adapter = adapter;
  }

  (0, _createClass3.default)(Images, [{
    key: 'show',
    value: function show(ids, type) {
      var params = {};
      if (typeof ids === 'string') {
        params.ids = ids;
      } else if (isArray(ids)) {
        params.ids = ids.join(',');
      } else {
        params.ids = '' + ids;
      }
      if (type) params.image_type = type;
      return this.adapter.request('GET', 'images?' + (0, _utils.queryStringBuilder)(params));
    }
  }]);
  return Images;
}();

exports.default = Images;