// COPYRIGHT (C)2022 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Load DEVA CORE Mind into Deva
const Deva = require('@feecting/deva');

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
    dir: false,
    ports: {
      api: vars.ports.api,
      socket: vars.ports.socket,
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
    /**************
    func: question
    params: packet
    describe: Ask the base deva a question.
    ***************/
    question(packet) {
      return new Promise((resolve, reject) => {
        if (!packet) return reject('NO PACKET');
        return resolve({text:'default response for now'})
      });
    },

    /**************
    func: devas
    params: packet
    describe: Build a list of devas currently loaded into the system.
    ***************/
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
  },
  methods: {
    /**************
    method: hash
    params: packet
    describe: Access core hash features to build has trail.
    ***************/
    hash(packet) {
      return this.hash(packet);
    },

    /**************
    method: question
    params: packet
    describe: Method to relaty to question function with packet information.
    ***************/
    question(packet) {
      return this.func.question(packet);
    },

    /**************
    method: devas
    params: packet
    describe: Call devas function and return list of system devas.
    ***************/
    devas(packet) {
      return this.func.devas(packet);
    },

    /**************
    method: client
    params: packet
    describe: Return the current client information loaded.
    ***************/
    client(packet) {
      return Promise.resolve({text: this.client.name, data:this.client});
    },

    /**************
    method: agent
    params: packet
    describe: Return the current agent information loaded.
    ***************/
    agent(packet) {
      return Promise.resolve({text: this.agent.name, data: this.agent});
    },

    /**************
    method: uid
    params: packet
    describe: Return system uid for the based deva.
    ***************/
    uid(packet) {
      const uid = this.uid();
      return Promise.resolve({text:uid,html:uid});
    },

    /**************
    method: status
    params: packet
    describe: Return the current status for the system deva.
    ***************/
    status(packet) {
      return this.status();
    },

    /**************
    method: help
    params: packet
    describe: Return the help files for the main system deva.
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

  /**************
  func: onStart
  params: none
  describe: The custom onStart state handler that calls this.enter();
  ***************/
  onStart() {
    return this.enter();
  },

  /**************
  func: onStop
  params: none
  describe: The custom onStop state handler to stop all the devas correctly.
  ***************/
  onStop() {
    return this.stopDevas().then(devasStopped => {
      this.prompt(devasStopped);
      return this.exit()
    }).catch(this.error);
  },

  /**************
  func: onEnter
  params: none
  describe: The custom onEnter state handler to initialize the Devas correctly.
  ***************/
  onEnter() {
    return this.initDevas().then(devasInit => {
      this.prompt(devasInit);
      return this.done(this.vars.messages.enter);
    });
  },

  /**************
  method: onExit
  params: none
  describe: The custom onExist state handler to exist the system properly.
  ***************/
  onExit() {
    return this.done(this.vars.messages.exit);
  },
});

module.exports = {DevaUI};
