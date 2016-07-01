import { buildRef, shouldSucceed, shouldError } from './helpers';
let BrandibbleRef = buildRef();

describe('Locations', () => {
  it('exists', () => { expect(BrandibbleRef.locations).to.exist });

  it('can show all locations', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });

  it('can show a menu for a location', done => {
    BrandibbleRef.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      BrandibbleRef.locations.menu(data[0].location_id).then(response => {
        let data = shouldSucceed(response);
        expect(data).to.be.a('array');
        done();
      });
    });
  });

  it('fails to show a menu for a location that does not exist', done => {
    BrandibbleRef.locations.menu(9999999999999).catch(response => {
      let errors = shouldError(response);
      expect(errors).to.be.a('array');
      expect(errors[0].code).to.equal('locations.validate.id_not_found');
      done();
    });
  });

});
