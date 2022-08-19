// Copyright (c)2021 Quinn Michaels
// Docs Deva test file

const {expect} = require('chai')
const docs = require('./index.js');

describe(docs.me.name, () => {
  beforeEach(() => {
    return docs.init()
  });
  it('Check the SVARGA Object', () => {
    expect(docs).to.be.an('object');
    expect(docs).to.have.property('me');
    expect(docs).to.have.property('vars');
    expect(docs).to.have.property('listeners');
    expect(docs).to.have.property('methods');
    expect(docs).to.have.property('modules');
  });
})
