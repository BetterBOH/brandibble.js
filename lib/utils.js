'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ISO8601_PATTERN = exports.PaymentTypes = exports.TestCreditCards = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.queryStringBuilder = queryStringBuilder;
exports.applyPollyfills = applyPollyfills;
exports.generateUUID = generateUUID;

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _validate = require('validate.js');

var _validate2 = _interopRequireDefault(_validate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window performance */
/* eslint space-infix-ops: 1, no-param-reassign: 1, no-restricted-syntax: 1, prefer-rest-params: 1, strict: 1  */
function dasherize(str) {
  return str.replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
}

function queryStringBuilder() {
  var queryObject = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return (0, _keys2.default)(queryObject).map(function (k) {
    /* Encode dates to Brandibble's almost ISO8601 Format */
    if (queryObject[k] instanceof Date) {
      var branddibleDateFormat = queryObject[k].toISOString().split('.')[0] + 'Z';
      return encodeURIComponent(k) + '=' + encodeURIComponent(branddibleDateFormat);
    }
    return encodeURIComponent(k) + '=' + encodeURIComponent(queryObject[k]);
  }).join('&');
}

function pad(number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

function applyPollyfills() {
  // Better length validation for numbers
  var length = _validate2.default.validators.length;
  _validate2.default.validators.length = function (value, options, key, attributes) {
    var _value = value;
    if (_validate2.default.isNumber(_value)) {
      _value = '' + _value;
    }
    return length.call(this, _value, options, key, attributes);
  };

  // Is Array for Validate.js
  _validate2.default.validators.isArray = function (value) {
    if (_validate2.default.isArray(value)) {
      return;
    }
    return 'must be an array';
  };

  if (typeof _promise2.default === 'undefined') {
    (0, _es6Promise2.default)();
  }

  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
      var date = this.getUTCFullYear();
      date += '-' + pad(this.getUTCMonth() + 1);
      date += '-' + pad(this.getUTCDate());
      date += 'T' + pad(this.getUTCHours());
      date += ':' + pad(this.getUTCMinutes());
      date += ':' + pad(this.getUTCSeconds());
      date += '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';

      return date;
    };
  }

  if (typeof _assign2.default !== 'function') {
    Object.assign = function (target) {
      'use strict';

      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (var index = 1; index < arguments.length; index += 1) {
        var source = arguments[index];
        if (source != null) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key];
            }
          }
        }
      }
      return target;
    };
  }
}

var TestCreditCards = exports.TestCreditCards = {
  visa: [{ response: 'approval', number: '4788250000121443' }, { response: 'refer_call', number: '4387751111111020' }, { response: 'do_not_honor', number: '4387751111111038' }, { response: 'card_expired', number: '4387751111111046' }, { response: 'insufficient_funds', number: '43877511111110531' }],
  mastercard: [{ response: 'approval', number: '5454545454545454' }, { response: 'refer_call', number: '5442981111111023' }, { response: 'do_not_honor', number: '5442981111111031' }, { response: 'card_expired', number: '5442981111111049' }, { response: 'insufficient_funds', number: '5442981111111056' }],
  amex: [{ response: 'approval', number: '371449635398431' }],
  discover: [{ response: 'approval', number: '6011000995500000' }, { response: 'refer_call', number: '6011000995511122' }, { response: 'do_not_honor', number: '6011000995511130' }, { response: 'card_expired', number: '6011000995511148' }, { response: 'insufficient_funds', number: '6011000995511155' }]
};

var PaymentTypes = exports.PaymentTypes = {
  CASH: 'cash',
  CREDIT: 'credit',
  LEVELUP: 'levelup'
};

var ISO8601_PATTERN = exports.ISO8601_PATTERN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

// http://stackoverflow.com/posts/8809472/revisions
function generateUUID() {
  var suffix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  var uuid = 'xxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  if (suffix && suffix.length) return '' + uuid + dasherize(suffix);
  return uuid;
}