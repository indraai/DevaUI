// Copyright (c)2021 Quinn Michaels
// Feecting Deva test file

const {expect} = require('chai')
const feecting = require('./index.js');

describe(feecting.me.name, () => {
  beforeEach(() => {
    return feecting.init()
  });
  it('Check the SVARGA Object', () => {
    expect(feecting).to.be.an('object');
    expect(feecting).to.have.property('me');
    expect(feecting).to.have.property('vars');
    expect(feecting).to.have.property('listeners');
    expect(feecting).to.have.property('methods');
    expect(feecting).to.have.property('modules');
  });
})
