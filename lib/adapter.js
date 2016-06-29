import { persist, retrieve } from './utils';
import polyfill from 'es6-promise';
if (typeof Promise === 'undefined') { polyfill(); }

function handleResponse(response) {
  const { status, statusText } = response;
  if (status >= 200 && status < 300) {
    if (statusText === 'NO CONTENT') { return true; }
    return response.json();
  }
  return response.json().then(error => {
    throw error;
  });
}

const LOCAL_STORAGE_KEY = 'brandibble';

export default class Adapter {
  constructor({ apiKey, apiBase }) {
    this.apiKey  = apiKey;
    this.apiBase = apiBase;
    this.localStorageKey = LOCAL_STORAGE_KEY;
    this.restoreCustomerToken();
  }

  customerId() {
    try {
      return JSON.parse(atob(this.customerToken.split('.')[1])).customer_id
    }
    catch (e) {
      return 0;
    }
  }

  restoreCustomerToken() {
    let data = retrieve(this.localStorageKey);
    this.customerToken = data.customerToken;
  }

  persistCustomerToken(customerToken) {
    this.customerToken = customerToken;
    persist(this.localStorageKey, { customerToken });
  }

  flushCustomerToken() {
    this.customerToken = null;
    persist(this.localStorageKey, { customerToken: null });
  }

  request(method, path, body) {
    return fetch(`${this.apiBase}${path}`, {
      method,
      headers: this.headers(),
      body: body ? JSON.stringify(body) : null,
      credentials: 'omit'
    }).then(handleResponse);
  }

  headers() {
    let headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
    if (this.customerToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    return headers;
  }
}
