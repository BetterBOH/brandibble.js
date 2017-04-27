/* global Brandibble expect it describe beforeEach */
/* eslint no-new:1 */
import productJSON from '../stubs/product.stub';

let bases;
let lineItem;
let sauces;
let sides;

describe('models/lineItem', () => {
  beforeEach(() => {
    lineItem = new Brandibble.LineItem(productJSON, 1);
    bases = lineItem.optionGroups()[0];
    sides = lineItem.optionGroups()[1];
    sauces = lineItem.optionGroups()[2];
  });

  it('can add option and increase quantity of option items', () => {
    lineItem.addOption(sides, sides.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.configuration[0].optionItems).to.have.length.of(2);
  });

  it('can remove option and decrease quantity of option items', () => {
    lineItem.addOption(sides, sides.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    lineItem.removeOption(sides.option_items[0]);
    expect(lineItem.configuration[0].optionItems).to.have.length.of(1);
  });

  it('handles validity', () => {
    expect(lineItem.isValid()).to.equal(false);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.length.of.at.least(2);

    expect(lineItem.errors()[0]).to.have.keys(['error', 'subject', 'subjectType', 'relatedConfiguration']);

    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);

    expect(lineItem.isValid()).to.equal(true);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.lengthOf(0);
  });

  it('allows products with an empty option_groups array', () => {
    lineItem = new Brandibble.LineItem({ id: 1, option_groups: [] }, 1);
    expect(lineItem.isValid()).to.equal(true);
  });

  it('can format itself', () => {
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.format()).to.contain.all.keys(['id', 'made_for', 'instructions', 'quantity', 'option_groups']);
  });

  it('can format itself for favorites', () => {
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.formatForFavorites()).to.contain.all.keys(['id', 'made_for', 'instructions', 'option_groups']);
  });

  it('it can not violate an option rule', () => {
    lineItem.addOption(bases, bases.option_items[0]);

    expect(() => {
      lineItem.addOption(bases, bases.option_items[1]);
    }).to.throw(Object);
  });

  it('can remove options', async () => {
    await lineItem.addOption(bases, bases.option_items[0]);
    await lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.isValid()).to.equal(true);
    lineItem.removeOption(bases.option_items[0]);
    expect(lineItem.isValid()).to.equal(false);
  });

  it('can not be created unless product is valid', () => {
    expect(() => { new Brandibble.LineItem({ nope: 'nein' }); }).to.throw(Object);
  });

  it('will maintains an operation map', () => {
    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(0);
  });

  it('will maintain relevant counts for each option group in the operationsMap', () => {
    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(0);
    expect(lineItem.operationMaps[0].canAddMoreToThisGroup).to.equal(true);

    lineItem.addOption(bases, bases.option_items[0]);

    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(1);
    expect(lineItem.operationMaps[0].canAddMoreToThisGroup).to.equal(false);
  });

  it('will maintain counts for included vs paid options in the operationsMap', () => {
    const saucesIndex = 2;
    expect(lineItem.operationMaps[saucesIndex].currentlySelectedCount).to.equal(0);
    expect(lineItem.operationMaps[saucesIndex].canAddMoreToThisGroup).to.equal(true);
    expect(lineItem.operationMaps[saucesIndex].remainingIncludedOptions).to.equal(1);
    expect(lineItem.operationMaps[saucesIndex].extraOptionsWillIncurCost).to.equal(false);

    sauces = lineItem.optionGroups()[saucesIndex];
    lineItem.addOption(sauces, sauces.option_items[0]);

    expect(lineItem.operationMaps[saucesIndex].currentlySelectedCount).to.equal(1);
    expect(lineItem.operationMaps[saucesIndex].canAddMoreToThisGroup).to.equal(true);
    expect(lineItem.operationMaps[saucesIndex].remainingIncludedOptions).to.equal(0);
    expect(lineItem.operationMaps[saucesIndex].extraOptionsWillIncurCost).to.equal(true);

    expect(lineItem.operationMaps[saucesIndex].optionItems[0].quantity).to.equal(1);
    expect(lineItem.operationMaps[saucesIndex].optionItems[0].presence).to.equal('PRESENT');
    expect(lineItem.operationMaps[saucesIndex].optionItems[0].allowedOperations.length).to.equal(2);

    expect(lineItem.operationMaps[saucesIndex].optionItems[0].allowedOperations[0].operation).to.equal('ADD');
    expect(lineItem.operationMaps[saucesIndex].optionItems[0].allowedOperations[0].costPerOperation).to.equal('0.46');
  });

  it('will calculate the price effect on the optionItem level', () => {
    const groupIndex = 1;

    /* This group doesn't include any free options */
    expect(lineItem.operationMaps[groupIndex].extraOptionsWillIncurCost).to.equal(true);

    sides = lineItem.optionGroups()[groupIndex];
    let newOption = sides.option_items[0];
    lineItem.addOption(sides, newOption);

    expect(lineItem.operationMaps[groupIndex].optionItems[0].effectOnPrice).to.equal('0.92');
    expect(lineItem.operationMaps[groupIndex].optionItems[0].quantityContributingToPrice).to.equal(1);

    newOption = sides.option_items[1];
    lineItem.addOption(sides, newOption);

    expect(lineItem.operationMaps[groupIndex].optionItems[0].effectOnPrice).to.equal('0.92');
    expect(lineItem.operationMaps[groupIndex].optionItems[0].quantityContributingToPrice).to.equal(1);

    expect(lineItem.operationMaps[groupIndex].optionItems[1].effectOnPrice).to.equal('0.00');
    expect(lineItem.operationMaps[groupIndex].optionItems[1].quantityContributingToPrice).to.equal(1);

    lineItem.removeOption(newOption);

    expect(lineItem.operationMaps[groupIndex].optionItems[1].effectOnPrice).to.equal('0.00');
    expect(lineItem.operationMaps[groupIndex].optionItems[1].quantityContributingToPrice).to.equal(0);

    newOption = sides.option_items[0];
    lineItem.addOption(sides, newOption);

    expect(lineItem.operationMaps[groupIndex].optionItems[0].effectOnPrice).to.equal('1.84');
    expect(lineItem.operationMaps[groupIndex].optionItems[0].quantityContributingToPrice).to.equal(2);
  });

  it('will calculate the price effect on the optionGroup level', () => {
    const groupIndex = 1;

    /* This group doesn't include any free options */
    expect(lineItem.operationMaps[groupIndex].extraOptionsWillIncurCost).to.equal(true);

    sides = lineItem.optionGroups()[groupIndex];
    let newOption = sides.option_items[0];

    lineItem.addOption(sides, newOption);
    expect(lineItem.operationMaps[groupIndex].totalEffectOnPrice).to.equal('0.92');

    /* Add an option with zero cost */
    newOption = sides.option_items[1];
    lineItem.addOption(sides, newOption);
    expect(lineItem.operationMaps[groupIndex].totalEffectOnPrice).to.equal('0.92');
  });

  it('will calculate the price effect for multiple of the same optionItem', () => {
    const item = sauces.option_items[0];
    const item2 = sauces.option_items[1];
    lineItem.addOption(sauces, item);
    lineItem.addOption(sauces, item);
    lineItem.addOption(sauces, item);
    lineItem.addOption(sauces, item2);

    const sauceGroup = lineItem.operationMaps[2];
    const itemsToBeChargedFor = sauceGroup.currentlySelectedCount - sauceGroup.optionGroupData.included_options;
    const expectedPrice = itemsToBeChargedFor * parseFloat(item.price);

    expect(parseFloat(sauceGroup.totalEffectOnPrice).toFixed(2)).to.equal(expectedPrice.toFixed(2));
  });
});
