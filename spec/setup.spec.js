import Brandibble from '..';
import localforage from 'localforage';
import { shouldSucceed, TestingUser, TestingAddress, UnsecureApiKey } from './helpers';
const { email, password } = TestingUser;

localforage.config({name: 'brandibble-test', storeName: 'brandibble-test'});

function ensureCustomerResourcesExist() {
  return window.Brandibble.customers.authenticate({ email, password }).then(() => {
    return window.Brandibble.addresses.all().then(response => {
      let addresses = shouldSucceed(response);
      if (addresses.length === 0) { return window.Brandibble.addresses.create(TestingAddress); };
      return addresses[0];
    });
  }).catch(error => console.log(error));
}

before( async () => {
  // Setup a Brandibble Ref, and add it to the Window
  const BrandibbleRef = await new Brandibble({
    apiKey: UnsecureApiKey,
    brandId: 6,
    apiEndpoint: 'https://staging.brandibble.co/api/',
    storage: localforage,
  });

  return BrandibbleRef.setup().then(Brandibble => {
    window.Brandibble = Brandibble;
    Brandibble.customers.create(TestingUser)
      .then(ensureCustomerResourcesExist, ensureCustomerResourcesExist);
  }).catch(error => console.log(error));
});
