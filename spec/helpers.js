import Brandibble from '..';

export function seedEmail() {
  return `sanctuary-testing-${(new Date()).valueOf().toString()}@example.com`;
}

export function seedText() {
  return `Testing ${(new Date()).valueOf().toString()}`;
}

export function buildRef() {
  return new Brandibble({
    apiKey: 'c2FuY3R1YXJ5IGNvbXB1dGVy',
    brandId: 6,
    apiEndpoint: 'http://unsecure.brandibble.co/api/'
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
