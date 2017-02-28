/* global Brandibble expect it describe */
import { shouldSucceed } from './helpers';

const LAT = 0.755912;
const LNG = -73.9709333;
const LAT_LNG = {
  latitude: LAT,
  longitude: LNG,
};
const LAT_LNG_IN_ZONE = {
  latitude: LAT,
  longitude: LNG,
  in_zone: true,
};

describe('Locations', () => {
  it('exists', () => expect(Brandibble.locations).to.exist);

  it('can show all locations', () => {
    return Brandibble.locations.index().then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  it('can show a specific location', () => {
    const locationId = 19;
    return Brandibble.locations.show(locationId).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.an('object');
    });
  });

  it('can show a specific location if passed lat and lng', () => {
    const locationId = 19;

    return Brandibble.locations.show(locationId, LAT, LNG).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.an('object');
    });
  });


  it('can show all locations if passed valid lat and lng', () => {
    return Brandibble.locations.index(LAT_LNG).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });

  it('can show all locations that are "in zone" if passed a boolean value', () => {
    return Brandibble.locations.index(LAT_LNG_IN_ZONE).then((response) => {
      const data = shouldSucceed(response);
      expect(data).to.be.a('array');
    });
  });


  it('returns errors if passed invalid param', () => {
    const locationId = '6hg';
    return Brandibble.locations.show(locationId).catch((errors) => {
      expect(errors).to.be.an('object');
    });
  });

  it('returns errors if passed invalid lat and lng', () => {
    const lat = 'hgjfhg';
    const lng = 'ghj3h4';

    return Brandibble.locations.index(lat, lng).catch((errors) => {
      expect(errors).to.be.an('object');
    });
  });
});
