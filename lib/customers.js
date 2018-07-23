'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Customers = function () {
  function Customers(adapter, events) {
    (0, _classCallCheck3.default)(this, Customers);

    this.adapter = adapter;
    this.events = events;
  }

  // STATEFUL METHODS


  (0, _createClass3.default)(Customers, [{
    key: 'authenticate',
    value: function authenticate(body) {
      var _this = this;

      return this.token(body).then(function (response) {
        return _this.adapter.persistCustomerToken(response.data.token).then(_this.current.bind(_this));
      });
    }
  }, {
    key: 'invalidate',
    value: function invalidate() {
      var promise = this.adapter.flushAll();
      this.events.triggerAsync('customers.invalidate', promise);
      return promise;
    }
  }, {
    key: 'current',
    value: function current() {
      return this.show(this.adapter.customerId());
    }
  }, {
    key: 'updateCurrent',
    value: function updateCurrent(body) {
      return this.update(body, this.adapter.customerId());
    }
  }, {
    key: 'currentLevelUpQRCode',
    value: function currentLevelUpQRCode() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      return this.levelUpQRCode(this.adapter.customerId(), params);
    }
  }, {
    key: 'currentLevelUpLoyalty',
    value: function currentLevelUpLoyalty() {
      return this.levelUpLoyalty(this.adapter.customerId());
    }
  }, {
    key: 'currentLevelUpCampaign',
    value: function currentLevelUpCampaign(campaignId, campaignType) {
      return this.levelUpCampaign(this.adapter.customerId(), campaignId, campaignType);
    }

    // STATELESS METHODS

    /* first_name, last_name, email, password, phone:opt */

  }, {
    key: 'create',
    value: function create(body) {
      var promise = this.adapter.request('POST', 'customers', body);
      this.events.triggerAsync('customers.create', promise);
      return promise;
    }
  }, {
    key: 'validateCustomer',
    value: function validateCustomer(body) {
      return this.adapter.request('POST', 'customers/validate', body);
    }

    /* email, password */

  }, {
    key: 'token',
    value: function token(body) {
      var promise = this.adapter.request('POST', 'customers/token', body);
      this.events.triggerAsync('customers.token', promise);
      return promise;
    }

    /* customer_id */

  }, {
    key: 'show',
    value: function show(customerId) {
      var promise = this.adapter.request('GET', 'customers/' + customerId);
      this.events.triggerAsync('customers.show', promise);
      return promise;
    }

    /* limit, sort, status */

  }, {
    key: 'orders',
    value: function orders(customerId) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = _querystring2.default.stringify(params);
      return this.adapter.request('GET', 'customers/' + customerId + '/orders?' + query);
    }

    /* first_name, last_name, email, password, phone:opt */

  }, {
    key: 'update',
    value: function update(body, customerId) {
      var promise = this.adapter.request('PUT', 'customers/' + customerId, body);
      this.events.triggerAsync('customers.update', promise);
      return promise;
    }
  }, {
    key: 'resetPassword',
    value: function resetPassword(body) {
      var promise = this.adapter.request('POST', 'customers/reset', body);
      this.events.triggerAsync('customers.resetPassword', promise);
      return promise;
    }

    // LEVELUP

    /* customer_id, code, color, tip_amount, tip_percent, width */

  }, {
    key: 'levelUpQRCode',
    value: function levelUpQRCode(customerId) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var query = _querystring2.default.stringify(params);
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/qr_code?' + query);
    }

    /* customer_id */

  }, {
    key: 'levelUpLoyalty',
    value: function levelUpLoyalty(customerId) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/loyalty');
    }

    /* update levelup permissions */

  }, {
    key: 'levelUpUpdate',
    value: function levelUpUpdate(customerId, password) {
      var data = { password: password };
      return this.adapter.request('PUT', 'customers/' + customerId + '/levelup', data);
    }

    /* connect level up account */

  }, {
    key: 'levelUpConnect',
    value: function levelUpConnect(customerId, email, password) {
      var data = { email: email };
      if (password) data.password = password;
      return this.adapter.request('POST', 'customers/' + customerId + '/levelup', data);
    }

    /* show levelup campaign */

  }, {
    key: 'levelUpCampaign',
    value: function levelUpCampaign(customerId, campaignId, campaignType) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/campaigns/' + campaignId + '/' + campaignType);
    }

    /* disconnect level up account */

  }, {
    key: 'levelUpDisconnect',
    value: function levelUpDisconnect(customerId) {
      return this.adapter.request('DELETE', 'customers/' + customerId + '/levelup');
    }
  }, {
    key: 'levelUpPaymentMethod',
    value: function levelUpPaymentMethod(customerId) {
      return this.adapter.request('GET', 'customers/' + customerId + '/levelup/payment_method');
    }
  }, {
    key: 'resetLevelUpPassword',
    value: function resetLevelUpPassword(body) {
      var promise = this.adapter.request('POST', 'customers/reset_levelup', body);
      this.events.triggerAsync('customers.resetLevelUpPassword', promise);
      return promise;
    }
  }]);
  return Customers;
}();

exports.default = Customers;