// Copyright (c)2022 Quinn Michaels
// MUD test file

const {expect} = require('chai')
const mud = require('./index.js');

describe(mud.me.name, () => {
  beforeEach(() => {
    return mud.init()
  });
  it('Check the SVARGA Object', () => {
    expect(mud).to.be.an('object');
    expect(mud).to.have.property('me');
    expect(mud).to.have.property('vars');
    expect(mud).to.have.property('listeners');
    expect(mud).to.have.property('methods');
    expect(mud).to.have.property('modules');
  });
})
