// Copyright (c):year: :copyright:
// :name:

const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const :key-upper: = new Deva({
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
    }
  },
  vars,
  listeners: {},
  modules: {},
  deva: {},
  func: {},
  methods: {
    /**************
    method: uid
    params: packet
    describe: Return a system id to the user.
    ***************/
    uid(packet) {
      return Promise.resolve({text:this.uid()});
    },
    /**************
    method: status
    params: packet
    describe: Return the current status of the Deva.
    ***************/
    status(packet) {
      return this.status();
    },
    /**************
    method: help
    params: packet
    describe: The Help method returns the information on how to use the Deva.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return this.question(`#feecting parse ${help}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(reject);
      });
    }
  },
});
module.exports = :key-upper:
