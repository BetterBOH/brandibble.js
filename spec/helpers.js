import Brandibble from '..';

export const TestingUser = {
  first_name: 'Sanctuary',
  last_name: 'Testing',
  email: 'sanctuary-testing-customer@example.com',
  password: 'password'
};

export const TestingAddress = {
  street_address: '123 Street St',
  unit: '4 FL',
  city: 'New York',
  state_code: 'NY',
  zip_code: 10013,
  latitude: 40.755912,
  longitude: -73.9709333,
  company: 'Sanctuary Computer, Inc.',
  contact_name: 'Hugh Francis',
  contact_phone: '5512213610'
};

export function seedEmail() {
  return `sanctuary-testing-${(new Date()).valueOf().toString()}@example.com`;
}

export const UnsecureApiKey = 'eyJhbGciOiJIUzI1NiIsImV4cCI6MTQ5ODU4MzQ0MiwiaWF0IjoxNDY3MDQ3NDQyfQ.eyJlbWFpbCI6Imh1Z2hAc2FuY3R1YXJ5Y29tcHV0ZXIuY29tIiwiZG9tYWluIjoiaHR0cHM6Ly9zYW5jdHVhcnkuY29tcHV0ZXIiLCJhcGlfdXNlcl9pZCI6MywibmFtZSI6IlNhbmN0dWFyeSJ9.clbyJWm-gj4Z120isZhL-Zk1Voy80pJJWsHfgnqGaxk';

export function seedText() {
  return `Testing ${(new Date()).valueOf().toString()}`;
}

export function buildRef() {
  return new Brandibble({
    apiKey: UnsecureApiKey,
    brandId: 6,
    apiEndpoint: 'https://staging.brandibble.co/api/'
  });
}

export function shouldSucceed(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('data');
  return response.data;
}

export function shouldError(response) {
  expect(response).to.be.a('object');
  expect(response).to.have.property('errors');
  return response.errors;
}
