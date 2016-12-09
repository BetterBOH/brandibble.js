import stubbedMapsResponse from '../googleMaps.stub';

describe('Address', () => {
  it('can be created with a maps response', () => {
    let address = new Brandibble.Address(stubbedMapsResponse);
  });
});
