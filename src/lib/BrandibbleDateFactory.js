import { isInvalidISOString } from '../utils';
import { DateTime } from 'luxon';

class BrandibbleDate {
  constructor(JSDateOrDateTimeString) {
    if (!this.date) {
      this.initializeDateTime(JSDateOrDateTimeString);
    }
  }

  initializeDateTime(JSDateOrDateTimeString) {
    /**
     * return a luxon DateTime object
     * for the current time
     */
    if (!JSDateOrDateTimeString) {
      this.date = DateTime.local();
      return this;
    }

    /**
     * return a luxon DateTime object
     * with the time of the passed JS Date
     */
    if (JSDateOrDateTimeString instanceof Date) {
      this.date = DateTime.fromJSDate(JSDateOrDateTimeString);
      return this;
    }

    /**
     * is passed return a luxon DateTime object
     * with the time of the ISO8601 date string
     */
    if (!isInvalidISOString(JSDateOrDateTimeString)) {
      this.date = DateTime.fromISO(JSDateOrDateTimeString);
      return this;
    }

    /**
     * Otherwise the incorrect argument(s)
     * were passed, so we throw an error
     */
    throw new Error(
      "Brandibble.js: Brandibble's DateTime expects either 1.) no arguments 2.) a valid JS Date object, 3.) a valid date string is ISO8601 format",
    );
  }

  tz(timeZoneString) {
    this.date.setZone(timeZoneString);
    return this;
  }

  toDate() {
    return this.date.toJSDate();
  }
}

export { BrandibbleDate };
/**
 * Factory returns an instance of BrandibbleDate
 * a class which implement's selection the
 * Moment.js API using luxon's DateTime object
 */
export default function (JSDateOrDateTimeString) {
  return new BrandibbleDate(JSDateOrDateTimeString);
}
