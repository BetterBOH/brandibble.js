import _ from 'lodash';
import validate from 'validate.js';
import { generateUUID } from 'brandibble/utils';

const extractAddressValues = mapsResponse => {
  let city, number, state_code, street, zip_code;
  let addressFields = mapsResponse.address_components;

  let fieldTypes = [
    'street_number',
    'route',
    'locality',
    'sublocality_level_1',
    'postal_code',
    'administrative_area_level_1'
  ];

  _.forEach(addressFields, function(field){
    let type = field.types[0];
    if(_.includes(fieldTypes, type)) {
      switch(type) {
        case 'street_number':
          number = field.long_name;
          break;
        case 'route':
          street = field.long_name;
          break;
        case 'sublocality_level_1':
          city = field.long_name;
          break;
        case 'locality':
          city = field.long_name;
          break;
        case 'administrative_area_level_1':
          state_code = field.short_name;
          break;
        case 'postal_code':
          zip_code = parseInt(field.long_name);
          break;
      }
    }
  });

  let lat = mapsResponse.geometry.location.lat;
  let lng = mapsResponse.geometry.location.lng;

  return {
    city: city,
    latitude: lat,
    longitude: lng,
    state_code: state_code,
    street_address: `${number} ${street}`,
    zip_code: zip_code
  };
}

export default class Address {
  constructor(mapsResponse) {
    this.uuid = generateUUID();
    this.attributes = extractAddressValues(mapsResponse);
  }

  isPersisted() {
    return !!this.attributes.customer_address_id;
  }

  format() {
    const {
      street_address,
      unit,
      city,
      state_code,
      zip_code,
      latitude,
      longitude,
      company,
      contact_name,
      contact_phone
    } = this.attributes;

    return {
      street_address,
      unit,
      city,
      state_code,
      zip_code,
      latitude,
      longitude,
      company,
      contact_name,
      contact_phone
    }
  }
}
