import { seedEmail, buildRef } from './helpers';
let BrandibbleRef = buildRef();

describe('Adapter', () => {
  it('builds the correct headers', () => {
    let headers = BrandibbleRef.adapter.headers();
    expect(headers).to.have.property('Content-Type', 'application/json');
    expect(headers).to.have.property('Brandibble-Api-Key', 'c2FuY3R1YXJ5IGNvbXB1dGVy');
  });
});
