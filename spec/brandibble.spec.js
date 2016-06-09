import { expect } from 'chai';
import { buildRef } from './helpers';
let BrandibbleRef = buildRef();

// Brandibble Wrapper
describe('Brandibble', () => {
  it('exists', () => expect(BrandibbleRef).to.exist);

  it('sets private variables', () => {
    expect(BrandibbleRef).to.have.property('adapter');
    let adapter = BrandibbleRef.adapter;
    expect(adapter).to.have.property('apiKey', 'c2FuY3R1YXJ5IGNvbXB1dGVy');
    expect(adapter).to.have.property('apiBase', 'http://unsecure.brandibble.co/api/v1/brands/6/');
  });
});

