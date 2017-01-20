import Brandibble from '..';
import { shouldSucceed, TestingUser, TestingAddress, UnsecureApiKey } from './helpers';
const { email, password } = TestingUser;


function ensureCustomerResourcesExist() {
  return window.Brandibble.customers.authenticate({ email, password }).then(() => {
    return window.Brandibble.addresses.all().then(response => {
      let addresses = shouldSucceed(response);
      if (addresses.length === 0) { return window.Brandibble.addresses.create(TestingAddress); };
      return addresses[0];
    });
  }).catch(error => console.log(error));
}

before(done => {
  // Setup a Brandibble Ref, and add it to the Window
  let BrandibbleRef = new Brandibble({
    apiKey: UnsecureApiKey,
    brandId: 6,
    apiEndpoint: 'https://staging.brandibble.co/api/'
  });

  return BrandibbleRef.setup().then(BrandibbleRef => {
    window.Brandibble = BrandibbleRef;
    BrandibbleRef.customers.create(TestingUser)
      .then(ensureCustomerResourcesExist, ensureCustomerResourcesExist)
      .then(() => done());
  }).catch(error => console.log(error));
});
