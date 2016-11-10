import { shouldSucceed, shouldError } from './helpers';

describe('Locations', () => {
  it('exists', () => { expect(Brandibble.locations).to.exist });

  it('can show all locations', done => {
    Brandibble.locations.index().then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });

  it('can show all locations if passed valid lat and lng', done => {
    const lat = 0.755912;
    const lng = -73.9709333;

    Brandibble.locations.index(lat, lng).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });

  it('returns errors if passed invalid lat and lng', done => {
    const lat = 'hgjfhg';
    const lng = 'ghj3h4';

    Brandibble.locations.index(lat, lng).catch(errors => {
      expect(errors).to.be.an('object');
      done();
    })
  });
});
