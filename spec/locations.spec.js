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

  it('can get wait times for a location', () => {
    const locationId = 19;
    return Brandibble.locations.waitTimes(locationId).then((response) => {
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

  it('can show a specific location if passed serviceType', () => {
    const locationId = 19;
    const serviceType = 'pickup';

    return Brandibble.locations
      .show(locationId, null, null, serviceType)
      .then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.an('object');
      });
  });

  it('can show a specific location if passed a valid requestedAt', () => {
    const locationId = 19;
    const requestedAt = `${new Date().toISOString().split('.')[0]}Z`;

    return Brandibble.locations
      .show(locationId, null, null, null, requestedAt)
      .then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.an('object');
      });
  });

  it('can show a specific location if passed a valid requestedAt in the future', () => {
    const locationId = 19;
    const today = new Date();
    const tomorrow = new Date().setDate(today.getDate() + 1);
    const futureRequestedAt = `${
      new Date(tomorrow).toISOString().split('.')[0]
    }Z`;

    return Brandibble.locations
      .show(locationId, null, null, null, futureRequestedAt)
      .then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.an('object');
      });
  });

  it('can show a specific location if passed a valid requestedAt in the future and valid serviceType', () => {
    const locationId = 19;
    const serviceType = 'pickup';
    const today = new Date();
    const tomorrow = new Date().setDate(today.getDate() + 1);
    const futureRequestedAt = `${
      new Date(tomorrow).toISOString().split('.')[0]
    }Z`;

    return Brandibble.locations
      .show(locationId, null, null, serviceType, futureRequestedAt)
      .then((response) => {
        const data = shouldSucceed(response);
        expect(data).to.be.an('object');
      });
  });

  it('can accept a queryObject as a second argument', () => {
    const locationId = 19;

    const queryObject = {
      service_type: 'pickup',
      requested_at: `${new Date().toISOString().split('.')[0]}Z`,
    };

    return Brandibble.locations.show(locationId, queryObject).then((response) => {
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
