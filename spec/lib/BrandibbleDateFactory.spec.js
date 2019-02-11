/* global Brandibble expect it describe */

describe('lib/BrandibbleDateFactory', () => {
  it('Expect BrandibbleDate to throw if passed an invalid argument', () => {
    const newOrder = () => new Brandibble.DateTime('djfbdasfbadg');
    expect(newOrder).to.throw;
  });

  it('Expect Brandibble Date to be instantiated with no arguments', () => {
    const TestBrandibbleDate = new Brandibble.DateTime();
    expect(TestBrandibbleDate).to.exist;
    expect(TestBrandibbleDate).to.have.property('date');
    expect(TestBrandibbleDate).to.respondTo('tz');
    expect(TestBrandibbleDate).to.respondTo('toDate');
  });

  it('Expect Brandibble Date to be instantiated with a JSDate as an argument', () => {
    const TestBrandibbleDate = new Brandibble.DateTime(new Date());
    expect(TestBrandibbleDate).to.exist;
    expect(TestBrandibbleDate).to.have.property('date');
    expect(TestBrandibbleDate).to.respondTo('tz');
    expect(TestBrandibbleDate).to.respondTo('toDate');
  });

  it('Expect Brandibble Date to be instantiated with a ISO8601 datetime string', () => {
    const ISO8601Date = new Date().toISOString().split('.')[0];
    const TestBrandibbleDate = new Brandibble.DateTime(ISO8601Date);
    expect(TestBrandibbleDate).to.exist;
    expect(TestBrandibbleDate).to.have.property('date');
    expect(TestBrandibbleDate).to.respondTo('tz');
    expect(TestBrandibbleDate).to.respondTo('toDate');
  });
});
