import { retrieve } from '../lib/utils';
import { seedEmail, seedText, shouldSucceed, shouldError } from './helpers';

describe('Customers', () => {
  beforeEach(() => window.localStorage.clear());

  it('exists', () => expect(Brandibble.customers).to.exist);

  it('can create a customer', done => {
    Brandibble.customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: seedEmail(),
      password: 'password'
    }).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.have.property('customer_id');
      expect(data).to.have.property('email');
      expect(data).to.have.property('first_name');
      expect(data).to.have.property('last_name');
      expect(data).to.have.property('phone');
      done();
    });
  });

  it('create fails with bad inputs', done => {
    Brandibble.customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: 'nope',
      password: 'password'
    }).catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(2);
      expect(errors[0]).to.have.property('code', 'customers.create.validation');
      expect(errors[1]).to.have.property('title', 'Please submit a valid email address.')
      done();
    });
  });

  it('can retrieve a token', done => {
    Brandibble.customers.token({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.have.property('token');
      done();
    });
  });

  it('fails to retrieve a token with bad inputs', done => {
    Brandibble.customers.token({
      email: 'sanctuary-testing-customer@example.com',
      password: 'nope'
    }).catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(2);
      expect(errors[0]).to.have.property('code', 'customers.login.validation');
      done();
    });
  });

  it('can authenticate the client with a current customer', done => {
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.have.property('email', 'sanctuary-testing-customer@example.com');

      // Customer Token is set in local storage
      expect(Brandibble.adapter.customerToken).to.be.a('string');

      Brandibble.customers.invalidate().then(() => {
        expect(Brandibble.adapter.customerToken).to.not.exist;
        done();
      });
    });
  });

  it('can validate a customers metadata', done => {
    Brandibble.customers.validateCustomer({ email: 'sanctuary-testing-customer@example.com' }).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.have.property('is_brandibble_active');
      expect(data).to.have.property('is_brandibble_customer');
      expect(data).to.have.property('is_levelup_connected');
      expect(data).to.have.property('is_levelup_user');
      expect(data).to.have.property('levelup_connected_email');
      done();
    });
  });

  it('cannot validate a customers metadata when email is invalid', done => {
    Brandibble.customers.validateCustomer({ email: 'sanctuary-testing-customer@example' }).catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(1);
      expect(errors[0]).to.have.property('code', 'customers.validate.invalid_email');
      done();
    });
  });

  it('can trigger a customers reset password flow', done => {
    Brandibble.customers.resetPassword({ email: "sanctuary-testing-customer@example.com" }).then(response => {
      expect(response).to.be.true;
      done();
    });
  });

  it('can not show a customer that does not belong to the current token', done => {
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      Brandibble.customers.show(1).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.show.token_mismatch');
        done();
      });
    });
  });

  it('can update the current customer', done => {
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let newLastName = seedText();
      Brandibble.customers.updateCurrent({
        last_name: newLastName
      }).then(response => {
        let data = shouldSucceed(response);
        expect(data.last_name).to.be.a('string', newLastName);
        done();
      });
    });
  });

  it('can not update a customer that does not own the current token', done => {
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let newLastName = seedText();
      Brandibble.customers.update({ last_name: newLastName }, 5).catch(response => {
        let errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.update.token_mismatch');
        done();
      });
    });
  });

  it('can retrieve a users orders', function(done) {
    this.timeout(10000);
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let customerId = response.data.customer_id;
      Brandibble.customers.orders(customerId).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.array;
        expect(data[0]).to.have.property('address');
        expect(data[0]).to.have.property('items');
        expect(data[0]).to.have.property('orders_id');
        done();
      });
    });
  });

  it('can retrieve a users upcoming orders', function(done) {
    this.timeout(10000);
    Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password'
    }).then(response => {
      let customerId = response.data.customer_id;
      Brandibble.customers.orders(customerId, {status:'upcoming'}).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.array;
        done();
      });
    });
  });
});
