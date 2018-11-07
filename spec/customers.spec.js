/* global Brandibble expect it describe beforeEach window */
import { seedEmail, seedText, shouldSucceed, shouldError, OrdersTestingUser } from './helpers';

describe('Customers', () => {
  beforeEach(() => window.localStorage.clear());

  it('exists', () => expect(Brandibble.customers).to.exist);

  it('can create a customer', () => {
    return Brandibble.customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: seedEmail(),
      password: 'password',
    }).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.have.property('customer_id');
      expect(data).to.have.property('email');
      expect(data).to.have.property('first_name');
      expect(data).to.have.property('last_name');
      expect(data).to.have.property('phone');
    });
  });

  it('create fails with bad inputs', () => {
    return Brandibble.customers.create({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: 'nope',
      password: 'password',
    }).catch((response) => {
      const errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(2);
      expect(errors[0]).to.have.property('code', 'customers.create.validation');
      expect(errors[1]).to.have.property('title', 'Please submit a valid email address.');
    });
  });

  it('can create and authenticate a customer', async () => {
    const seededEmail = seedEmail();
    const response = await Brandibble.customers.createAndAuthenticate({
      first_name: 'Sanctuary',
      last_name: 'Testing',
      email: seededEmail,
      password: 'password',
    });

    const data = await shouldSucceed(response);

    expect(data).to.have.property('email', seededEmail);
    // Customer Token is set in local storage
    expect(Brandibble.adapter.customerToken).to.be.a('string');

    await Brandibble.customers.invalidate();
    expect(Brandibble.adapter.customerToken).to.not.exist;
  });

  it('create and authenticate fails with bad inputs', async () => {
    try {
      await Brandibble.customers.createAndAuthenticate({
        first_name: 'Sanctuary',
        last_name: 'Testing',
        email: 'nope',
        password: 'password',
      });
    } catch (error) {
      const errors = shouldError(error);

      expect(errors).to.be.a('array').to.have.lengthOf(2);
      expect(errors[0]).to.have.property('code', 'customers.create.validation');
      expect(errors[1]).to.have.property('title', 'Please submit a valid email address.');
    }
  });

  it('can retrieve a token', () => {
    return Brandibble.customers.token({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.have.property('token');
    });
  });

  it('fails to retrieve a token with bad inputs', () => {
    return Brandibble.customers.token({
      email: 'sanctuary-testing-customer@example.com',
      password: 'nope',
    }).catch((response) => {
      const errors = shouldError(response);
      expect(errors).to.be.a('array').to.have.lengthOf(2);
      expect(errors[0]).to.have.property('code', 'customers.login.validation.brandibble');
    });
  });

  it('can authenticate the client with a current customer', async () => {
    const response = await Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    });
    const data = await shouldSucceed(response);

    expect(data).to.have.property('email', 'sanctuary-testing-customer@example.com');
    // Customer Token is set in local storage
    expect(Brandibble.adapter.customerToken).to.be.a('string');

    await Brandibble.customers.invalidate();
    expect(Brandibble.adapter.customerToken).to.not.exist;
  });

  it('can validate a customers metadata', async () => {
    const response = await Brandibble.customers.validateCustomer({ email: 'sanctuary-testing-customer@example.com' });
    const data = await shouldSucceed(response);
    expect(data).to.have.property('is_brandibble_active');
    expect(data).to.have.property('is_brandibble_customer');
    expect(data).to.have.property('is_levelup_connected');
    expect(data).to.have.property('is_levelup_user');
    expect(data).to.have.property('levelup_connected_email');
  });

  it('cannot validate a customers metadata when email is invalid', () => {
    return Brandibble.customers.validateCustomer({ email: 'sanctuary-testing-customer@example.com' }).catch((response) => {
      const errors = shouldError(response);
      expect(errors).to.be.a('array');
      expect(errors[0]).to.have.property('code', 'customers.validate.invalid_email');
    });
  });

  it('can trigger a customers reset password flow', async () => {
    const response = await Brandibble.customers.resetPassword({ email: 'sanctuary-testing-customer@example.com' });
    expect(response).to.be.true;
  });

  it('can attempt to complete a customer\'s reset password flow', async () => {
    try {
      await Brandibble.customers.finishResetPassword('123141254jlasdfjwqer', {
        password: 'newpassword',
      });
    } catch (response) {
      const errors = shouldError(response);
      expect(errors).to.be.a('array');
      expect(errors[0]).to.have.property('code', 'customers.reset.invalid_token');
    }
  });

  it('can not show a customer that does not belong to the current token', () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      return Brandibble.customers.show(1).catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.show.token_mismatch');
      });
    });
  });

  it('can update the current customer', () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      const newLastName = seedText();
      return Brandibble.customers.updateCurrent({
        last_name: newLastName,
      }).then((response) => {
        const data = shouldSucceed(response);
        expect(data.last_name).to.be.a('string', newLastName);
      });
    });
  });

  it('can not update a customer that does not own the current token', () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      const newLastName = seedText();
      return Brandibble.customers.update({ last_name: newLastName }, 5).catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.update.token_mismatch');
      });
    });
  });

  it('can check for qr code from levelup', () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      return Brandibble.customers.currentLevelUpQRCode().catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.levelup.qr_code.show.missing_token');
      });
    });
  });

  it('can check for loyalty from levelup', () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      return Brandibble.customers.currentLevelUpLoyalty().catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.levelup.loyalty.show.missing_token');
      });
    });
  });

  it('can check for customer loyalties', async () => {
    const response = await Brandibble.customers.authenticate({
      email: 'sanctuary-orders-testing-customer@example.com',
      password: 'password',
    });
    const { customer_id } = response.data;
    const data = await Brandibble.customers.loyalties(customer_id);
    const loyalties = await shouldSucceed(data);
    expect(loyalties).to.be.array;
  });

  it('can retrieve a users orders', async () => {
    this.timeout(10000);
    const response = await Brandibble.customers.authenticate({
      email: 'sanctuary-orders-testing-customer@example.com',
      password: 'password',
    });
    const { customer_id } = response.data;
    const data = await Brandibble.customers.orders(customer_id);
    const orders = await shouldSucceed(data);
    expect(orders).to.be.array;
  });


  it('can retrieve a users upcoming orders', async () => {
    this.timeout(10000);
    const { email, password } = OrdersTestingUser;
    const response = await Brandibble.customers.authenticate({ email, password });
    const { customer_id } = response.data;
    const data = await Brandibble.customers.orders(customer_id, { status: 'upcoming' });
    const orders = await shouldSucceed(data);
    expect(orders).to.be.array;
  });

  /* Campaign Loyalty must be setup in the Brandibble levelup integration panel
   * for this to work, and given our test case here isn't setup, we're just testing
   * the failure case for now.
   */
  it('can retrieve levelup campaign info for a user', async () => {
    return Brandibble.customers.authenticate({
      email: 'sanctuary-testing-customer@example.com',
      password: 'password',
    }).then(() => {
      return Brandibble.customers.currentLevelUpCampaign(1, 'basic_v1').catch((response) => {
        const errors = shouldError(response);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.have.property('code', 'customers.levelup.campaigns.show.missing_token');
      });
    });
  });
});
