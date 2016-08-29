import { buildRef } from './../helpers';
import productJSON from './../product.stub';
let Brandibble = buildRef();

describe('LineItem', () => {
  it('handles validity', () => {
    let lineItem = new Brandibble.LineItem(productJSON, 1);
    expect(lineItem.isValid()).to.equal(false);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.lengthOf(2);

    expect(lineItem.errors()[0]).to.have.keys(['error', 'subject', 'subjectType', 'relatedConfiguration']);

    let bases = lineItem.optionGroups()[0];
    let sides = lineItem.optionGroups()[1];
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);

    expect(lineItem.isValid()).to.equal(true);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.lengthOf(0);
  });

  it('can format itself', () => {
    let lineItem = new Brandibble.LineItem(productJSON, 1);
    let bases = lineItem.optionGroups()[0];
    let sides = lineItem.optionGroups()[1];
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.format()).to.contain.all.keys(['id', 'made_for', 'instructions', 'quantity', 'option_groups']);
  });

  it('it can not violate an option rule', () => {
    let lineItem = new Brandibble.LineItem(productJSON, 1);
    let bases = lineItem.optionGroups()[0];
    lineItem.addOption(bases, bases.option_items[0]);

    expect(() => {
      lineItem.addOption(bases, bases.option_items[1]);
    }).to.throw(Object);
  });

  it('can remove options', () => {
    let lineItem = new Brandibble.LineItem(productJSON, 1);
    let bases = lineItem.optionGroups()[0];
    let sides = lineItem.optionGroups()[1];
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.isValid()).to.equal(true);
    lineItem.removeOption(bases.option_items[0]);
    expect(lineItem.isValid()).to.equal(false);
  });

  it('can not be created unless product is valid', () => {
    expect(() => { new Brandibble.LineItem({nope: 'nein'}); }).to.throw(Object);
  });
});
