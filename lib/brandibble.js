'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

var _events = require('./events');

var _events2 = _interopRequireDefault(_events);

var _customers = require('./customers');

var _customers2 = _interopRequireDefault(_customers);

var _locations = require('./locations');

var _locations2 = _interopRequireDefault(_locations);

var _addresses = require('./addresses');

var _addresses2 = _interopRequireDefault(_addresses);

var _menus = require('./menus');

var _menus2 = _interopRequireDefault(_menus);

var _orders = require('./orders');

var _orders2 = _interopRequireDefault(_orders);

var _payments = require('./payments');

var _payments2 = _interopRequireDefault(_payments);

var _allergens = require('./allergens');

var _allergens2 = _interopRequireDefault(_allergens);

var _favorites = require('./favorites');

var _favorites2 = _interopRequireDefault(_favorites);

var _ratings = require('./ratings');

var _ratings2 = _interopRequireDefault(_ratings);

var _images = require('./images');

var _images2 = _interopRequireDefault(_images);

var _order = require('./models/order');

var _order2 = _interopRequireDefault(_order);

var _lineItem = require('./models/lineItem');

var _lineItem2 = _interopRequireDefault(_lineItem);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _utils.applyPollyfills)();

var Storage = function () {
  function Storage() {
    (0, _classCallCheck3.default)(this, Storage);
  }

  (0, _createClass3.default)(Storage, [{
    key: 'config',
    value: function config() {
      return this;
    }
  }], [{
    key: 'setItem',
    value: function setItem() {
      return _promise2.default.resolve();
    }
  }, {
    key: 'getItem',
    value: function getItem() {
      return _promise2.default.resolve();
    }
  }, {
    key: 'removeItem',
    value: function removeItem() {
      return _promise2.default.resolve();
    }
  }, {
    key: 'clear',
    value: function clear() {
      return _promise2.default.resolve();
    }
  }]);
  return Storage;
}();

var Brandibble = function () {
  function Brandibble(_ref) {
    var apiKey = _ref.apiKey,
        brandId = _ref.brandId,
        _ref$apiEndpoint = _ref.apiEndpoint,
        apiEndpoint = _ref$apiEndpoint === undefined ? null : _ref$apiEndpoint,
        _ref$apiVersion = _ref.apiVersion,
        apiVersion = _ref$apiVersion === undefined ? null : _ref$apiVersion,
        _ref$origin = _ref.origin,
        origin = _ref$origin === undefined ? null : _ref$origin,
        _ref$storage = _ref.storage,
        storage = _ref$storage === undefined ? null : _ref$storage,
        _ref$requestTimeout = _ref.requestTimeout,
        requestTimeout = _ref$requestTimeout === undefined ? null : _ref$requestTimeout;
    (0, _classCallCheck3.default)(this, Brandibble);

    if (!apiKey) {
      throw new Error('Brandibble.js: Please pass apiKey to the constructor options.');
    }
    if (!brandId) {
      throw new Error('Brandibble.js: Please pass brandId to the constructor options.');
    }

    var _apiEndpoint = apiEndpoint || 'https://www.brandibble.co/api/';
    var _apiVersion = apiVersion || 'v1';
    var _storage = storage || new Storage();
    var _requestTimeout = requestTimeout || false;

    var apiBase = '' + _apiEndpoint + _apiVersion + '/brands/' + brandId + '/';

    /* Build adapter */
    this.adapter = new _adapter2.default({ apiKey: apiKey, apiBase: apiBase, origin: origin, storage: _storage, requestTimeout: _requestTimeout });
    this.events = new _events2.default();

    /* Build Resources */
    this.Order = _order2.default;
    this.LineItem = _lineItem2.default;

    /* Build Resources */
    this.customers = new _customers2.default(this.adapter, this.events);
    this.locations = new _locations2.default(this.adapter);
    this.addresses = new _addresses2.default(this.adapter);
    this.menus = new _menus2.default(this.adapter);
    this.orders = new _orders2.default(this.adapter, this.events);
    this.payments = new _payments2.default(this.adapter);
    this.allergens = new _allergens2.default(this.adapter);
    this.favorites = new _favorites2.default(this.adapter);
    this.ratings = new _ratings2.default(this.adapter);
    this.images = new _images2.default(this.adapter);

    /* Misc */
    this.TestCreditCards = _utils.TestCreditCards;
  }

  (0, _createClass3.default)(Brandibble, [{
    key: 'setup',
    value: function setup() {
      var _this = this;

      return this.adapter.restoreCustomerToken().then(function () {
        return _this.adapter.restoreCurrentOrder().then(function () {
          return _this;
        });
      });
    }

    /* subject:string:required body:string:required email:string name:string */

  }, {
    key: 'sendSupportTicket',
    value: function sendSupportTicket() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.adapter.request('POST', 'support_ticket', data);
    }
  }]);
  return Brandibble;
}();

exports.default = Brandibble;