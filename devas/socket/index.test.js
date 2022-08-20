// Copyright (c)2022 Quinn Michaels
// SOCKET test file

const {expect} = require('chai')
const socket = require('./index.js');

describe(socket.me.name, () => {
  beforeEach(() => {
    return socket.init()
  });
  it('Check the SVARGA Object', () => {
    expect(socket).to.be.an('object');
    expect(socket).to.have.property('me');
    expect(socket).to.have.property('vars');
    expect(socket).to.have.property('listeners');
    expect(socket).to.have.property('methods');
    expect(socket).to.have.property('modules');
  });
})
