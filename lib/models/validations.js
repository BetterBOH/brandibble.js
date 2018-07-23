"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var cardValidations = exports.cardValidations = {
  cc_number: {
    presence: true,
    length: { minimum: 15, maximum: 16 }
  },
  cc_cvv: {
    presence: true,
    length: { minimum: 3, maximum: 4 }
  },
  cc_zip: {
    presence: true,
    numericality: true,
    length: { is: 5 }
  },
  cc_expiration: {
    presence: true,
    length: { is: 4 }
  }
};

var customerValidations = exports.customerValidations = {
  email: {
    presence: true,
    email: true
  },
  password: {
    length: { minimum: 6 }
  },
  first_name: {
    presence: true
  },
  last_name: {
    presence: true
  }
};

var addressValidations = exports.addressValidations = {
  street_address: {
    presence: true,
    length: { minimum: 3 }
  },
  unit: {},
  city: {
    presence: true,
    length: { minimum: 3 }
  },
  state_code: {
    presence: true,
    length: { is: 2 }
  },
  zip_code: {
    presence: true,
    length: { is: 5 }
  },
  latitude: {
    presence: true,
    numericality: true
  },
  longitude: {
    presence: true,
    numericality: true
  },
  company: {
    length: { minimum: 3 }
  },
  contact_name: {},
  contact_phone: {}
};

var productValidations = exports.productValidations = {
  id: {
    presence: true,
    numericality: true
  },
  option_groups: {
    isArray: true
  }
};