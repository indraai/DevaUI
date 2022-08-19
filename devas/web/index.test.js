// Copyright (c)2021 Quinn Michaels
// WebDEVA test file

const {expect} = require('chai')
const web = require('./index.js');

describe(web.me.name, () => {
  beforeEach(() => {
    return web.init()
  });
  it('Check the DEVA Object', () => {
    expect(web).to.be.an('object');
    expect(web).to.have.property('agent');
    expect(web).to.have.property('vars');
    expect(web).to.have.property('listeners');
    expect(web).to.have.property('methods');
    expect(web).to.have.property('modules');
  });
})
