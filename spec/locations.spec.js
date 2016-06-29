import { buildRef, shouldSucceed } from './helpers';
let BrandibbleRef = buildRef();

describe('Locations', () => {
  it('exists', () => { expect(BrandibbleRef.locations).to.exist });

  it('can show all locations', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  it('can show a menu for a location', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      BrandibbleRef.locations.show(data[0].location_id).then(response => {
        debugger;

      });
    });
  });

});
