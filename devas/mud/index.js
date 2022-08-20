// Copyright (c)2022 Quinn Michaels
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const MUD = new Deva({
  agent: {
    uid: agent.uid,
    key: agent.key,
    name: agent.name,
    describe: agent.describe,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      return input.trim();
    },
  },
  vars,
  listeners: require('./_listeners.js'),
  modules: {
    game: false,
  },
  deva: {},
  func: require('./_func.js'),
  methods: require('./_methods.js'),
  onError(e) {
    console.error(e);
  }
});
module.exports = MUD
