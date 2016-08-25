import { buildRef, shouldSucceed, TestingUser, TestingAddress } from './helpers';
let BrandibbleRef = buildRef();
const { email, password } = TestingUser;

function ensureCustomerResourcesExist() {
  return BrandibbleRef.customers.authenticate({ email, password }).then(() => {
    return BrandibbleRef.addresses.all().then(response => {
      let addresses = shouldSucceed(response);
      if (addresses.length === 0) { return BrandibbleRef.addresses.create(TestingAddress); };
      return addresses[0];
    });
  });
}

before(done => {
  BrandibbleRef.customers.create(TestingUser)
    .then(ensureCustomerResourcesExist, ensureCustomerResourcesExist)
    .then(() => done());
});
