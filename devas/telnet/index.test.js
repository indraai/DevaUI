// Copyright (c)2022 Quinn Michaels
// Telnet Deva test file

const {expect} = require('chai')
const telnet = require('./index.js');

describe(telnet.me.name, () => {
  beforeEach(() => {
    return telnet.init()
  });
  it('Check the SVARGA Object', () => {
    expect(telnet).to.be.an('object');
    expect(telnet).to.have.property('me');
    expect(telnet).to.have.property('vars');
    expect(telnet).to.have.property('listeners');
    expect(telnet).to.have.property('methods');
    expect(telnet).to.have.property('modules');
  });
})
