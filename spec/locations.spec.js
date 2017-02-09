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

  it('can show a specific location', done => {
    const locationId = 19;
    Brandibble.locations.show(locationId).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.an('object');
      done();
    });
  });

  it('can show a specific location if passed lat and lng', done => {
    const locationId = 19;
    const lat = 0.755912;
    const lng = -73.9709333;

    Brandibble.locations.show(locationId, lat, lng).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.an('object');
      done();
    });
  });


  it('can show all locations if passed valid lat and lng', done => {
    const latLng = {
      latitude: 0.755912,
      longitude: -73.9709333
    }

    Brandibble.locations.index(latLng).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });

  it('can show all locations that are "in zone" if passed a boolean value', done => {
    const latLngInZone = {
      latitude: 0.755912,
      longitude: -73.9709333,
      in_zone: true
    }

    Brandibble.locations.index(latLngInZone).then(response => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      done();
    });
  });


  it('returns errors if passed invalid param', done => {
    const locationId = '6hg';

    Brandibble.locations.show(locationId).catch(errors => {
      expect(errors).to.be.an('object');
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
