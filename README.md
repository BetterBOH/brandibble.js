# Brandibble.JS

An API wrapper for communicating with the Brandibble API in the browser.  Currently not compatible
with Node.JS environments (but could easily, we'd just need two build targets, and an isomorphic
fetch library).

### Usage

```js
import Brandibble from 'brandibble';

// Build a global Brandibble Ref

let BrandibbleRef = new Brandibble({
  apiKey: '12345',
  brandId: 23
});

// Create A Customer
let password = 'password';

Brandibble.customers.create({
  first_name: 'Sanctuary',
  last_name: 'Computer',
  email: 'hello@sanctuary.computer',
  password
}).then(response => {
  // Authenticate that new customer
  return BrandibbleRef.customers.authenticate({ response.email, password });
});

// Now your client will be authenticated (that state is persisted over 
// page refreshes in localStorage), which you can check like so:

let isAuthenticated = !!BrandibbleRef.adapter.customerToken;

// Now you can fetch the current user
Brandibble.customers.current().then(currentCustomer => {
  console.log(`Welcome to Brandibble ${currentCustomer.first_name}!`);
})
```

### Detailed Usage

**Every method returns a promise (unless otherwise noted).**

**A note on statefulness:**

Brandibble.JS provides a slew of both stateful (dependent on the adapter's state), and stateless 
(simple, 'dumb' methods).  It's totally up to the developer how to use these - but generally the
stateful methods are simply composed of a few stateless methods.

##### Adapter

Used for serializing and deserializing JSON, and making requests.  The adapter is also responsible
for restoring data from LocalStorage (or Cookies, for Safari Private Browsing).  Check the object
for more info (lib/adapter.js).

##### Customers

*Stateful Methods*
  - `Brandibble.customers.authenticate({ email, password })`
  - `Brandibble.customers.invalidate()`
  - `Brandibble.customers.current()`
  - `Brandibble.customers.updateCurrent({ email, password, first_name, last_name, phone })`

*Stateless Methods*

  - `Brandibble.customers.create({ email, password, first_name, last_name, phone })`
  - `Brandibble.customers.resetPassword({ email })`
  - `Brandibble.customers.token({ email, password })` 
      - Not necessary with `authenticate`.
  - `Brandibble.customers.show(customerId)` 
      - Not necessary with `current`.
  - `Brandibble.customers.update({ email, password, first_name, last_name, phone }, customerId)`
      - Not necessary with `updateCurrent`.


