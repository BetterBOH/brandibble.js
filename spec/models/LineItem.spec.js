/* global Brandibble expect it describe */
/* eslint no-new:1 */
import productJSON from './../product.stub';

describe('LineItem', () => {
  it('handles validity', () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    expect(lineItem.isValid()).to.equal(false);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.length.of.at.least(2);

    expect(lineItem.errors()[0]).to.have.keys(['error', 'subject', 'subjectType', 'relatedConfiguration']);

    const bases = lineItem.optionGroups()[0];
    const sides = lineItem.optionGroups()[1];
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);

    expect(lineItem.isValid()).to.equal(true);
    expect(lineItem.errors()).to.be.an('array');
    expect(lineItem.errors()).to.have.lengthOf(0);
  });

  it('allows products with an empty option_groups array', () => {
    const lineItem = new Brandibble.LineItem({ id: 1, option_groups: [] }, 1);
    expect(lineItem.isValid()).to.equal(true);
  });

  it('can format itself', () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const bases = lineItem.optionGroups()[0];
    const sides = lineItem.optionGroups()[1];
    lineItem.addOption(bases, bases.option_items[0]);
    lineItem.addOption(sides, sides.option_items[0]);
    expect(lineItem.format()).to.contain.all.keys(['id', 'made_for', 'instructions', 'quantity', 'option_groups']);
  });

  it('it can not violate an option rule', () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const bases = lineItem.optionGroups()[0];
    lineItem.addOption(bases, bases.option_items[0]);

    expect(() => {
      lineItem.addOption(bases, bases.option_items[1]);
    }).to.throw(Object);
  });

  it('can remove options', async () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const bases = lineItem.optionGroups()[0];
    const sides = lineItem.optionGroups()[1];
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
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(0);
  });

  it('will maintain relevant counts for each option group in the operationsMap', () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(0);
    expect(lineItem.operationMaps[0].canAddMoreToThisGroup).to.equal(true);

    const bases = lineItem.optionGroups()[0];
    lineItem.addOption(bases, bases.option_items[0]);

    expect(lineItem.operationMaps[0].currentlySelectedCount).to.equal(1);
    expect(lineItem.operationMaps[0].canAddMoreToThisGroup).to.equal(false);
  });

  it('will maintain counts for included vs paid options in the operationsMap', () => {
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const saucesIndex = 2;
    expect(lineItem.operationMaps[saucesIndex].currentlySelectedCount).to.equal(0);
    expect(lineItem.operationMaps[saucesIndex].canAddMoreToThisGroup).to.equal(true);
    expect(lineItem.operationMaps[saucesIndex].remainingIncludedOptions).to.equal(1);
    expect(lineItem.operationMaps[saucesIndex].extraOptionsWillIncurCost).to.equal(false);

    const sauces = lineItem.optionGroups()[saucesIndex];
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
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const groupIndex = 1;

    /* This group doesn't include any free options */
    expect(lineItem.operationMaps[groupIndex].extraOptionsWillIncurCost).to.equal(true);

    const sides = lineItem.optionGroups()[groupIndex];
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
    const lineItem = new Brandibble.LineItem(productJSON, 1);
    const groupIndex = 1;

    /* This group doesn't include any free options */
    expect(lineItem.operationMaps[groupIndex].extraOptionsWillIncurCost).to.equal(true);

    const sides = lineItem.optionGroups()[groupIndex];
    let newOption = sides.option_items[0];

    lineItem.addOption(sides, newOption);
    expect(lineItem.operationMaps[groupIndex].totalEffectOnPrice).to.equal('0.92');

    /* Add an option with zero cost */
    newOption = sides.option_items[1];
    lineItem.addOption(sides, newOption);
    expect(lineItem.operationMaps[groupIndex].totalEffectOnPrice).to.equal('0.92');
  });
});
