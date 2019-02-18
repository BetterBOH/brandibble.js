/* global Brandibble expect it describe before */
import { shouldSucceed } from './helpers';
import validBrand from './stubs/brand.stub';

describe('Brands', () => {
  it('exists', () => expect(Brandibble.brands).to.exist);

  it('can show a brand', () => {
    return Brandibble.brands.show().then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.deep.equal(validBrand);
    });
  });
});
