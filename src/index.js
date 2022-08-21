
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
      return new Promise((resolve, reject) => {
        const devas = [];
        try {
          for (let deva in this.devas) {
            devas.push(`cmd:#${deva} help`);
          }
        } catch (e) {
          return this.error(e, packet, reject);
        } finally {
          this.question(`#feecting parse ${devas.join('\n')}`).then(parsed => {
            return resolve({
              text:parsed.a.text,
              html:parsed.a.html,
              data:parsed.a.data,
            })
          }).catch(err => {
            return this.error(err, packet, reject);
          })
        }
      });
    },
    hash(packet) {
      return this.hash(packet);
    }
  },
  methods: {
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
      const uid = this.uid();
      return Promise.resolve({text:uid,html:uid});
    },
    status() {
      return this.status();
    },
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
