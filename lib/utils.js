/* global window performance */
/* eslint space-infix-ops: 1, no-param-reassign: 1, no-restricted-syntax: 1, prefer-rest-params: 1, strict: 1  */
import polyfill from 'es6-promise';
import validate from 'validate.js';

export function queryStringBuilder(queryObject = {}) {
  return (Object.keys(queryObject)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(queryObject[k])}`)
    .join('&')
  );
}

function pad(number) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}

export function applyPollyfills() {
  // Better length validation for numbers
  const length = validate.validators.length;
  validate.validators.length = function (value, options, key, attributes) {
    let _value = value;
    if (validate.isNumber(_value)) {
      _value = `${_value}`;
    }
    return length.call(this, _value, options, key, attributes);
  };

  // Is Array for Validate.js
  validate.validators.isArray = function (value) {
    if (validate.isArray(value)) { return; }
    return 'must be an array';
  };

  if (typeof Promise === 'undefined') { polyfill(); }

  if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
      let date = this.getUTCFullYear();
      date += `-${pad(this.getUTCMonth() + 1)}`;
      date += `-${pad(this.getUTCDate())}`;
      date += `T${pad(this.getUTCHours())}`;
      date += `:${pad(this.getUTCMinutes())}`;
      date += `:${pad(this.getUTCSeconds())}`;
      date += `.${(this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)}Z`;

      return date;
    };
  }

  if (typeof Object.assign !== 'function') {
    Object.assign = function (target) {
      'use strict';

      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      target = Object(target);
      for (let index = 1; index < arguments.length; index += 1) {
        const source = arguments[index];
        if (source != null) {
          for (const key in source) {
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

export const TestCreditCards = {
  visa: [
    { response: 'approval', number: '4788250000121443' },
    { response: 'refer_call', number: '4387751111111020' },
    { response: 'do_not_honor', number: '4387751111111038' },
    { response: 'card_expired', number: '4387751111111046' },
    { response: 'insufficient_funds', number: '43877511111110531' },
  ],
  mastercard: [
    { response: 'approval', number: '5454545454545454' },
    { response: 'refer_call', number: '5442981111111023' },
    { response: 'do_not_honor', number: '5442981111111031' },
    { response: 'card_expired', number: '5442981111111049' },
    { response: 'insufficient_funds', number: '5442981111111056' },
  ],
  amex: [
    { response: 'approval', number: '371449635398431' },
  ],
  discover: [
    { response: 'approval', number: '6011000995500000' },
    { response: 'refer_call', number: '6011000995511122' },
    { response: 'do_not_honor', number: '6011000995511130' },
    { response: 'card_expired', number: '6011000995511148' },
    { response: 'insufficient_funds', number: '6011000995511155' },
  ],
};

export const PaymentTypes = {
  CASH: 'cash',
  CREDIT: 'credit',
};


export const ISO8601_PATTERN = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;

// http://stackoverflow.com/posts/8809472/revisions
export function generateUUID() {
  let d = new Date().getTime();
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
}
