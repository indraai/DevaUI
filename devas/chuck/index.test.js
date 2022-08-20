// Copyright (c)2022 Quinn Michaels
// Chuck Norris test file

const {expect} = require('chai')
const chuck = require('./index.js');

describe(chuck.me.name, () => {
  beforeEach(() => {
    return chuck.init()
  });
  it('Check the DEVA Object', () => {
    expect(chuck).to.be.an('object');
    expect(chuck).to.have.property('agent');
    expect(chuck).to.have.property('vars');
    expect(chuck).to.have.property('listeners');
    expect(chuck).to.have.property('methods');
    expect(chuck).to.have.property('modules');
  });
})
