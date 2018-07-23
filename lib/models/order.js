'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _validate = require('validate.js');

var _validate2 = _interopRequireDefault(_validate);

var _cart9 = require('./cart');

var _cart10 = _interopRequireDefault(_cart9);

var _lineItem = require('./lineItem');

var _lineItem2 = _interopRequireDefault(_lineItem);

var _utils = require('../utils');

var _validations = require('./validations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultOptions = {
  include_utensils: true,
  notes_for_store: '',
  tip: 0,
  promo_code: ''
};

var serviceTypes = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup'
};

var ASAP_STRING = 'asap';

var Order = function () {
  function Order(adapter, location_id) {
    var serviceType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : serviceTypes.DELIVERY;
    var paymentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var miscOptions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : defaultOptions;
    (0, _classCallCheck3.default)(this, Order);

    this.uuid = (0, _utils.generateUUID)();
    this.adapter = adapter;
    this.cart = new _cart10.default();
    this.creditCard = null;
    this.locationId = location_id;
    this.serviceType = serviceType;
    /* Ensure each object owns it's miscOptions */
    this.miscOptions = (0, _assign2.default)({}, miscOptions);
    this.requestedAt = ASAP_STRING;
    this.paymentType = paymentType;
    /* This is here so that we can internally mark when
     * a user actually wants a future order, versus the
     * case when we manually set requested_at because we
     * were given a future daypart during a Brandibble menu
     * request cycle. */
    this.wantsFutureOrder = false;
  }

  (0, _createClass3.default)(Order, [{
    key: 'rehydrateCart',
    value: function rehydrateCart() {
      var _this = this;

      var serializedCart = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      (serializedCart.lineItems || []).forEach(function (serializedLineItem) {
        var product = serializedLineItem.product,
            quantity = serializedLineItem.quantity,
            madeFor = serializedLineItem.madeFor,
            instructions = serializedLineItem.instructions,
            configuration = serializedLineItem.configuration,
            uuid = serializedLineItem.uuid;
        /* Important: add directly from cart to avoid new writes to localforage */

        var lineItem = _this.cart.addLineItem(product, quantity, uuid);
        lineItem.madeFor = madeFor;
        lineItem.instructions = instructions;
        lineItem.configuration = configuration;
        lineItem._generateOperationMaps();
      });
      return this;
    }
  }, {
    key: 'setRequestedAt',
    value: function setRequestedAt() {
      var timestampOrAsap = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ASAP_STRING;
      var userWantsFutureOrder = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof userWantsFutureOrder !== 'boolean') {
        throw new Error('Brandibble.js: You must pass a boolean as the second argument (`userWantsFutureOrder`) to `Order#setRequestedAt`.');
      }
      if (timestampOrAsap === ASAP_STRING) {
        if (userWantsFutureOrder) {
          throw new Error('Brandibble.js: You can not pass `true` for `userWantsFutureOrder` when setting the Order#requested_at to `asap`.');
        }
        this.requestedAt = ASAP_STRING;
        return this.adapter.persistCurrentOrder(this);
      }

      var result = (0, _validate2.default)({ timestamp: timestampOrAsap }, { timestamp: { format: _utils.ISO8601_PATTERN } });
      if (!result) {
        this.wantsFutureOrder = userWantsFutureOrder;
        this.requestedAt = timestampOrAsap;
        return this.adapter.persistCurrentOrder(this);
      }
      return _promise2.default.reject(result);
    }
  }, {
    key: 'setCustomer',
    value: function setCustomer(customer) {
      var customer_id = customer.customer_id;

      if (customer_id) {
        this.customer = { customer_id: customer_id };
        return this.adapter.persistCurrentOrder(this);
      }
      var result = (0, _validate2.default)(customer, _validations.customerValidations);
      if (!result) {
        this.customer = customer;
        return this.adapter.persistCurrentOrder(this);
      }
      return _promise2.default.reject(result);
    }
  }, {
    key: 'setPromoCode',
    value: function setPromoCode(promo) {
      this.miscOptions.promo_code = promo;
      return this.adapter.persistCurrentOrder(this);
    }
  }, {
    key: 'setMiscOptions',
    value: function setMiscOptions() {
      var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.miscOptions = (0, _extends3.default)({}, this.miscOptions, opts);
      return this.adapter.persistCurrentOrder(this);
    }
  }, {
    key: 'setPaymentMethod',
    value: function setPaymentMethod() {
      var _this2 = this;

      var paymentType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _utils.PaymentTypes.CASH;
      var cardOrCashTip = arguments[1];

      this.paymentType = paymentType;
      return this.adapter.persistCurrentOrder(this).then(function () {
        switch (paymentType) {
          case _utils.PaymentTypes.CASH:
            {
              var tip = cardOrCashTip.tip;

              _this2.miscOptions.tip = tip || 0;
              return _this2.adapter.persistCurrentOrder(_this2);
            }
          case _utils.PaymentTypes.LEVELUP:
            {
              _this2.creditCard = null;
              return _this2.adapter.persistCurrentOrder(_this2);
            }
          case _utils.PaymentTypes.CREDIT:
            {
              /* For Unsetting Credit Card */
              if (!cardOrCashTip) {
                _this2.creditCard = null;
                return _this2.adapter.persistCurrentOrder(_this2);
              }
              var customer_card_id = cardOrCashTip.customer_card_id;

              if (customer_card_id) {
                _this2.creditCard = { customer_card_id: customer_card_id };
                return _this2.adapter.persistCurrentOrder(_this2);
              }
              /* The user is trying to set a non-persisted card on the order */
              var result = (0, _validate2.default)(cardOrCashTip, _validations.cardValidations);
              if (!result) {
                _this2.creditCard = cardOrCashTip;
                /* Important! Don't persist raw card info to LocalStorage */
                return _promise2.default.resolve(_this2);
              }
              return _promise2.default.reject(result);
            }
          default:
          // do nothing
        }
      });
    }
  }, {
    key: 'setAddress',
    value: function setAddress(address) {
      /* For Unsetting Address */
      if (!address) {
        this.address = address;
        return this.adapter.persistCurrentOrder(this);
      }
      var customer_address_id = address.customer_address_id;

      if (customer_address_id) {
        this.address = { customer_address_id: customer_address_id };
        return this.adapter.persistCurrentOrder(this);
      }
      var result = (0, _validate2.default)(address, _validations.addressValidations);
      if (!result) {
        this.address = address;
        return this.adapter.persistCurrentOrder(this);
      }
      return _promise2.default.reject(result);
    }
  }, {
    key: 'setLocation',
    value: function setLocation() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (id) {
        this.locationId = id;
        return this.adapter.persistCurrentOrder(this);
      }
      return _promise2.default.reject('Location ID cannot be blank');
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return this.cart.isValid();
    }
  }, {
    key: 'pushLineItem',
    value: function pushLineItem(lineItem) {
      if (lineItem instanceof _lineItem2.default) {
        this.cart.lineItems.push(lineItem);
        return this.adapter.persistCurrentOrder(this).then(function () {
          return lineItem;
        });
      }
      return _promise2.default.reject('Must pass an instance of the Brandibble.LineItem model.');
    }
  }, {
    key: 'addLineItem',
    value: function addLineItem() {
      if (this.locationId) {
        var _cart;

        var lineItem = (_cart = this.cart).addLineItem.apply(_cart, arguments);
        return this.adapter.persistCurrentOrder(this).then(function () {
          return lineItem;
        });
      }
      return _promise2.default.reject('Location ID cannot be blank');
    }
  }, {
    key: 'addOptionToLineItem',
    value: function addOptionToLineItem() {
      var _cart2;

      var lineItem = (_cart2 = this.cart).addOptionToLineItem.apply(_cart2, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'removeOptionFromLineItem',
    value: function removeOptionFromLineItem() {
      var _cart3;

      var lineItem = (_cart3 = this.cart).removeOptionFromLineItem.apply(_cart3, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'getLineItemQuantity',
    value: function getLineItemQuantity() {
      var _cart4;

      return (_cart4 = this.cart).getLineItemQuantity.apply(_cart4, arguments);
    }
  }, {
    key: 'setLineItemQuantity',
    value: function setLineItemQuantity() {
      var _cart5;

      var lineItem = (_cart5 = this.cart).setLineItemQuantity.apply(_cart5, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'setLineItemMadeFor',
    value: function setLineItemMadeFor() {
      var _cart6;

      var lineItem = (_cart6 = this.cart).setLineItemMadeFor.apply(_cart6, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'setLineItemInstructions',
    value: function setLineItemInstructions() {
      var _cart7;

      var lineItem = (_cart7 = this.cart).setLineItemInstructions.apply(_cart7, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return lineItem;
      });
    }
  }, {
    key: 'removeLineItem',
    value: function removeLineItem() {
      var _cart8;

      var remainingLineItems = (_cart8 = this.cart).removeLineItem.apply(_cart8, arguments);
      return this.adapter.persistCurrentOrder(this).then(function () {
        return remainingLineItems;
      });
    }
  }, {
    key: 'formatForValidation',
    value: function formatForValidation() {
      return {
        location_id: this.locationId,
        service_type: this.serviceType,
        requested_at: this.requestedAt,
        promo_code: this.promo_code,
        cart: this.cart.format()
      };
    }
  }, {
    key: 'formatCustomer',
    value: function formatCustomer() {
      if (!this.customer) {
        return {};
      }
      if (this.customer.customer_id) {
        return { customer_id: this.customer.customer_id };
      }
      return {
        email: this.customer.email,
        password: this.customer.password,
        first_name: this.customer.first_name,
        last_name: this.customer.last_name
      };
    }
  }, {
    key: 'formatAddress',
    value: function formatAddress() {
      if (!this.address) {
        return {};
      }
      var _address = this.address,
          customer_address_id = _address.customer_address_id,
          city = _address.city,
          longitude = _address.longitude,
          latitude = _address.latitude,
          state_code = _address.state_code,
          street_address = _address.street_address,
          zip_code = _address.zip_code,
          unit = _address.unit,
          company = _address.company,
          contact_name = _address.contact_name,
          contact_phone = _address.contact_phone;

      if (customer_address_id) {
        return { customer_address_id: customer_address_id };
      }
      return {
        city: city,
        longitude: longitude,
        latitude: latitude,
        state_code: state_code,
        street_address: street_address,
        zip_code: zip_code,
        unit: unit,
        company: company,
        contact_name: contact_name,
        contact_phone: contact_phone
      };
    }
  }, {
    key: 'formatCard',
    value: function formatCard() {
      if (!this.creditCard) {
        return {};
      }
      var _creditCard = this.creditCard,
          customer_card_id = _creditCard.customer_card_id,
          cc_expiration = _creditCard.cc_expiration,
          cc_number = _creditCard.cc_number,
          cc_zip = _creditCard.cc_zip,
          cc_cvv = _creditCard.cc_cvv;

      if (customer_card_id) {
        return { customer_card_id: customer_card_id };
      }
      return { cc_expiration: cc_expiration, cc_number: cc_number, cc_zip: cc_zip, cc_cvv: cc_cvv };
    }
  }, {
    key: 'format',
    value: function format() {
      var _miscOptions = this.miscOptions,
          include_utensils = _miscOptions.include_utensils,
          notes_for_store = _miscOptions.notes_for_store,
          tip = _miscOptions.tip,
          promo_code = _miscOptions.promo_code;


      var payload = {
        uuid: this.uuid,
        customer: this.formatCustomer(),
        location_id: this.locationId,
        service_type: this.serviceType,
        requested_at: this.requestedAt,
        cart: this.cart.format(),
        include_utensils: include_utensils,
        notes_for_store: notes_for_store,
        promo_code: promo_code,
        payment_type: this.paymentType
      };

      if (this.serviceType === serviceTypes.DELIVERY) {
        payload.address = this.formatAddress();
      }

      switch (payload.payment_type) {
        case _utils.PaymentTypes.CASH:
          payload.tip = tip;
          break;
        case _utils.PaymentTypes.CREDIT:
          payload.credit_card = this.formatCard();
          break;
        default:
          // do nothing
          break;
      }

      return payload;
    }
  }]);
  return Order;
}();

exports.default = Order;