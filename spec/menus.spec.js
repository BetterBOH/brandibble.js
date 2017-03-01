/* global Brandibble expect it describe before */
import moment from 'moment-timezone';
import { shouldSucceed, shouldError } from './helpers';

describe('Menus', () => {
  it('exists', () => expect(Brandibble.menus).to.exist);

  describe('building a menu', () => {
    let response;

    before(() => {
      return Brandibble.locations.index().then((res) => {
        response = res;
      });
    });

    it('can build a menu for a location', () => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      return Brandibble.menus.build(data[0].location_id, 'pickup').then((res) => {
        data = shouldSucceed(res);
        expect(data).to.be.a('object');
      }).catch(error => console.log(error.errors[0].code));
    });

    it('can build a menu for a location for a specific time', () => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      let date = new Date();
      date = moment(date).tz('America/New_York').toDate();
      date.setDate(date.getDate() + 1);
      return Brandibble.menus.build(19, 'delivery', date).then((res) => {
        data = shouldSucceed(res);
        expect(data).to.be.a('object').to.have.property('expires_at');
        const expirationDate = new Date(data.expires_at).toDateString();
        expect(expirationDate).to.equal(date.toDateString());
      }).catch(error => console.log(error.errors[0].code));
    });

    it('can not build a menu for a location when the service in not enabled', () => {
      let data = shouldSucceed(response);
      expect(data).to.be.a('array');
      return Brandibble.menus.build(data[0].location_id, 'delivery').catch((res) => {
        data = shouldError(res);
        expect(data).to.be.a('array');
        expect(data[0].code).to.equal('orders.validate.service_type_unavailable');
      });
    });
  });

  it('fails to show a menu for a location that does not exist', () => {
    return Brandibble.menus.build(9999999999999).catch((res) => {
      const errors = shouldError(res);
      expect(errors).to.be.a('array');
      expect(errors[0].code).to.equal('locations.validate.id_not_found');
    });
  });
});
