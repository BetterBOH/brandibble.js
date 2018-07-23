'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _circularJson = require('circular-json');

var _circularJson2 = _interopRequireDefault(_circularJson);

var _order2 = require('./models/order');

var _order3 = _interopRequireDefault(_order2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global atob fetch */
function BrandibbleRequestException(message, response, exception, extracted) {
  this.message = 'Brandibble.js: ' + (message || 'An unknown exception was triggered.');
  this.stack = new Error().stack;
  this.response = response;
  this.exception = exception;
  this.extracted = extracted;
}

var FiveHundredError = {
  errors: [{
    code: 'errors.server.internal',
    title: 'Internal Server Error',
    status: 500
  }]
};

/* Ensure the only persisted information here is customer_card_id */
function sanitizeCreditCard(order) {
  var _order = order;
  if (_order.creditCard) {
    var customer_card_id = _order.creditCard.customer_card_id;

    if (customer_card_id) {
      _order.creditCard = { customer_card_id: customer_card_id };
    } else {
      _order.creditCard = null;
    }
  }
  return _order;
}

/*
 * Brandibble 500 Errors aren't JSON, so we wrap them
 * here.  Otherwise, we attempt to parse everything as
 * JSON, and in the case we can't, we throw a big' ol
 * error, that is intended to be used with error logging.
 */
function handleResponse(response) {
  var status = response.status,
      statusText = response.statusText;

  if (status === 500) {
    throw FiveHundredError;
  }
  if (statusText === 'NO CONTENT' || status === 204) {
    return true;
  }
  /* Store a clone so the host app can re-read the error, however
   * react native's clone doesn't seem to be defined
   */
  var requestWasSuccessful = status >= 200 && status < 300;
  var cloned = response.clone ? response.clone() : response;
  try {
    return response.text().then(function (text) {
      var parsed = {};
      if (!text) {
        if (requestWasSuccessful) return parsed;
        throw parsed;
      }
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        throw new BrandibbleRequestException('Response text could not be parsed as JSON.', cloned, e, text);
      }
      if (requestWasSuccessful) return parsed;
      throw parsed;
    });
  } catch (e) {
    throw new BrandibbleRequestException('Response could not be extracted as Text.', cloned, e);
  }
}

var Adapter = function () {
  function Adapter(_ref) {
    var apiKey = _ref.apiKey,
        apiBase = _ref.apiBase,
        origin = _ref.origin,
        storage = _ref.storage,
        requestTimeout = _ref.requestTimeout;
    (0, _classCallCheck3.default)(this, Adapter);

    this.apiKey = apiKey;
    this.apiBase = apiBase;
    this.origin = origin;
    this.storage = storage;
    this.requestTimeout = requestTimeout;

    /* Lifecycle Specific State */
    this.currentOrder = null;
    this.customerToken = null;
  }

  (0, _createClass3.default)(Adapter, [{
    key: 'customerId',
    value: function customerId() {
      try {
        return JSON.parse(atob(this.customerToken.split('.')[1])).customer_id;
      } catch (e) {
        return 0;
      }
    }
  }, {
    key: 'flushAll',
    value: function flushAll() {
      var _this = this;

      return this.storage.clear().then(function (res) {
        _this.currentOrder = null;
        _this.customerToken = null;
        return res;
      });
    }
  }, {
    key: 'restoreCurrentOrder',
    value: function restoreCurrentOrder() {
      var _this2 = this;

      return this.storage.getItem('currentOrder').then(function (serializedOrder) {
        if (!serializedOrder) return;

        var _CircularJSON$parse = _circularJson2.default.parse(serializedOrder),
            uuid = _CircularJSON$parse.uuid,
            locationId = _CircularJSON$parse.locationId,
            serviceType = _CircularJSON$parse.serviceType,
            miscOptions = _CircularJSON$parse.miscOptions,
            requestedAt = _CircularJSON$parse.requestedAt,
            cart = _CircularJSON$parse.cart,
            paymentType = _CircularJSON$parse.paymentType,
            customer = _CircularJSON$parse.customer,
            address = _CircularJSON$parse.address,
            creditCard = _CircularJSON$parse.creditCard,
            wantsFutureOrder = _CircularJSON$parse.wantsFutureOrder;

        var order = new _order3.default(_this2, locationId, serviceType, paymentType, miscOptions);
        if (wantsFutureOrder) {
          order.wantsFutureOrder = wantsFutureOrder;
        }
        if (address) {
          order.address = address;
        }
        if (customer) {
          order.customer = customer;
        }
        if (paymentType) {
          order.paymentType = paymentType;
        }
        if (requestedAt) {
          order.requestedAt = requestedAt;
        }
        if (creditCard) {
          order.creditCard = creditCard;
        }
        if (uuid) {
          order.uuid = uuid;
        }
        _this2.currentOrder = order.rehydrateCart(cart);
        return _this2.currentOrder;
      });
    }
  }, {
    key: 'persistCurrentOrder',
    value: function persistCurrentOrder(order) {
      var _order = order;
      this.currentOrder = _order;
      /* Ensure raw Credit Card data isn't persisted to this.storage */
      if (_order.creditCard) {
        var creditCardData = (0, _assign2.default)({}, _order.creditCard);

        return this.storage.setItem('currentOrder', _circularJson2.default.stringify(sanitizeCreditCard(_order))).then(function () {
          _order.creditCard = creditCardData;
          return _order;
        });
      }
      return this.storage.setItem('currentOrder', _circularJson2.default.stringify(_order)).then(function () {
        return _order;
      });
    }
  }, {
    key: 'flushCurrentOrder',
    value: function flushCurrentOrder() {
      var _this3 = this;

      return this.storage.removeItem('currentOrder').then(function (res) {
        _this3.currentOrder = null;
        return res;
      });
    }
  }, {
    key: 'restoreCustomerToken',
    value: function restoreCustomerToken() {
      var _this4 = this;

      return this.storage.getItem('customerToken').then(function (customerToken) {
        return _this4.customerToken = customerToken;
      });
    }
  }, {
    key: 'persistCustomerToken',
    value: function persistCustomerToken(customerToken) {
      var _this5 = this;

      return this.storage.setItem('customerToken', customerToken).then(function () {
        return _this5.storage.getItem('customerToken').then(function (token) {
          return _this5.customerToken = token;
        });
      });
    }
  }, {
    key: 'request',
    value: function request(method, path, body) {
      var _this6 = this;

      if (this.requestTimeout) {
        return new _promise2.default(function (resolve, reject) {
          var timerId = setTimeout(function () {
            reject(new Error('Brandibble.js: The ' + method + ' request to ' + path + ' timed out after ' + _this6.requestTimeout + '.'));
          }, _this6.requestTimeout);
          fetch('' + _this6.apiBase + path, {
            method: method,
            headers: _this6.headers(),
            body: body ? (0, _stringify2.default)(body) : null,
            credentials: 'omit'
          }).then(function (response) {
            clearTimeout(timerId);
            return response;
          }).then(handleResponse).then(resolve, reject);
        });
      }
      return fetch('' + this.apiBase + path, {
        method: method,
        headers: this.headers(),
        body: body ? (0, _stringify2.default)(body) : null,
        credentials: 'omit'
      }).then(handleResponse);
    }
  }, {
    key: 'headers',
    value: function headers() {
      var headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
      if (this.origin) {
        headers.Origin = this.origin;
      }
      if (this.customerToken) {
        headers['Brandibble-Customer-Token'] = this.customerToken;
      }
      return headers;
    }
  }]);
  return Adapter;
}();

exports.default = Adapter;