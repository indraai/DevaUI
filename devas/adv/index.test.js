// Copyright (c)2021 Quinn Michaels
// Adventure Deva test file

const {expect} = require('chai')
const adventure = require('./index.js');

describe(adventure.me.name, () => {
  beforeEach(() => {
    return adventure.init()
  });
  it('Check the SVARGA Object', () => {
    expect(adventure).to.be.an('object');
    expect(adventure).to.have.property('me');
    expect(adventure).to.have.property('vars');
    expect(adventure).to.have.property('listeners');
    expect(adventure).to.have.property('methods');
    expect(adventure).to.have.property('modules');
  });
})
