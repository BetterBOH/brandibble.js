"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Events = function () {
  function Events() {
    (0, _classCallCheck3.default)(this, Events);

    this._callStack = [];
  }

  (0, _createClass3.default)(Events, [{
    key: "triggerAsync",
    value: function triggerAsync(key, promise) {
      var _this = this;

      promise.then(function (response) {
        _this.trigger(key + ".success", response);
        return response;
      }).catch(function (response) {
        _this.trigger(key + ".failure", response);
        return response;
      });
    }
  }, {
    key: "trigger",
    value: function trigger(key, response) {
      this._callStack.forEach(function (func) {
        return func(key, response);
      });
    }
  }, {
    key: "subscribe",
    value: function subscribe(callback) {
      this._callStack.push(callback);
    }
  }]);
  return Events;
}();

exports.default = Events;