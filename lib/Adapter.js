import polyfill from 'es6-promise';
if (typeof Promise === 'undefined') { polyfill(); }

function checkStatus(response) {
  const { status } = response;
  if (status >= 200 && status < 300) {
    return response;
  }
  let error = new Error(response.statusText)
  error.response = response;
  throw error;
}

function parseJSON(response) {
  return response.json()
}

export default class Adapter {
  constructor({ apiKey, apiBase }) {
    this.apiKey  = apiKey;
    this.apiBase = apiBase;
    //this.customerToken = this._restoreCustomerToken();
  }

  request(method, path, body={}) {
    return fetch(`${this.apiBase}${path}`, {
      method,
      headers: this.headers(),
      body: JSON.stringify(body),
      credentials: 'omit'
    }).then(checkStatus).then(parseJSON);
  }

  getCustomerId() {
    // TODO: This seems basic
    return atob(this.customerToken.split('.')[1]).customer_id;
  }

  headers() {
    let headers = { 'Brandibble-Api-Key': this.apiKey, 'Content-Type': 'application/json' };
    if (this.customerToken) { headers['Brandibble-Customer-Token'] = this.customerToken; }
    return headers;
  }
}
