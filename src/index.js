
// COPYRIGHT (C)2022 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Load DEVA CORE Mind into Deva
const Deva = require('@indra.ai/deva');

const fs = require('fs');
const path = require('path');
const {vars, agent, client} = require('../data');
const devas = require('../devas');

const DevaUI = new Deva({
  agent: {
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
  client,
  config: {
    ports: {
      api: vars.ports.api,
    }
  },
  lib: require('./lib'),
  vars,
  listeners: {},
  modules: {
    mind: false,
    psy: [],
  },
  devas,
  func: {
    question(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject('NO PACKET');
        return resolve({text:'default response for now'})
      });
    },
    devas(packet) {
      for (let deva in this.devas) {
        console.log('this deva we are looping', deva);
      }
      return Promise.resolve('devas')
    },
    hash(packet) {
      return this.hash(packet);
    }
  },
  methods: {
    shortcut(packet) {
      console.log('SHORTCUT', packet.q.text);
      this.vars.shortcut = packet.q.text
    },
    hash(packet) {
      return this.func.hash(packet);
    },
    question(packet) {
      return this.func.question(packet);
    },
    devas(packet) {
      return this.func.devas(packet);
    },
    client(packet) {
      return Promise.resolve({text: this.client.name, data:this.client});
    },
    agent(packet) {
      return Promise.resolve({text: this.agent.name, data: this.agent});
    },
    // return a new uid
    uid() {
      return Promise.resolve({text:this.uid()});
    },
    status() {
      return this.status();
    },
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(text => {
          return resolve({text})
        }).catch(reject);
      });
    }
  },
  onStart() {
    return this.enter();
  },
  onStop() {
    return this.stopDevas().then(devasStopped => {
      this.prompt(devasStopped);
      return this.exit()
    }).catch(this.error);
  },
  onEnter() {
    return this.initDevas().then(devasInit => {
      this.prompt(devasInit);
      return this.done(this.vars.messages.enter);
    });
  },
  onExit() {
    return this.done(this.vars.messages.exit);
  },
});

module.exports = {DevaUI};
