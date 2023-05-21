// COPYRIGHT (C)2022 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Load DEVA CORE Mind into Deva
const Deva = require('@indra.ai/deva');

const os = require('os');
const fs = require('fs');
const path = require('path');

const {vars, agent} = require('../data');
const devas = require('../devas');

const DevaUI = new Deva({
  agent: {
    id: 3848019052036,
    key: agent.key,
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
  client:false,
  config: {
    dir: false,
    ports: {
      api: vars.ports.api,
      socket: vars.ports.socket,
    }
  },
  lib: require('./lib'),
  vars,
  listeners: {
    'state'(packet) {
      this.func.cliprompt(packet);
    },
    'zone'(packet) {
      this.func.cliprompt(packet);
    },
    'feature'(packet) {
      this.func.cliprompt(packet);
    },
    'mode'(packet) {
      this.func.cliprompt(packet);
    },
    'action'(packet) {
      this.func.cliprompt(packet);
    },

    'clearshell'(packet) {
      this.func.cliprompt(packet);
    },
  },
  modules: {
    mind: false,
    psy: [],
  },
  devas,
  func: {
    cliprompt(packet) {
      let text = `#${packet.agent.key}:${packet.key} ${packet.text} - ${this.formatDate(packet.creted, 'numeric', true)}`;
      if (this.vars.labels[packet.value]) text = `${this.vars.labels[packet.value]}:${text}`
      this.talk('cliprompt', text); // clears cli line
      console.log(text);
      this.talk('cliprompt', text); // clears cli line
    },
    /**************
    func: question
    params: packet
    describe: Ask the base deva a question.
    ***************/
    question(packet) {
      return new Promise((resolve, reject) => {
        if (!packet.q.text) return reject(this._messages.notext);
        return resolve(this._state);
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
          }).catch(reject)
        }
      });
    },
  },
  methods: {
    /**************
    method: client
    params: packet
    describe: Return the current client information loaded.
    ***************/
    client(packet) {
      const text = `${this._client.prompt.emoji} #${this._client.key} | ${this._client.profile.name} |  ${this._client.id}`;
      return Promise.resolve({text, data:this._client});
    },

    /**************
    method: agent
    params: packet
    describe: Return the current agent information loaded.
    ***************/
    agent(packet) {
      const text = `${this._agent.prompt.emoji} #${this._agent.key} ${this._agent.profile.name} |  ${this._agent.id}`;
      return Promise.resolve({text, data: this._agent});
    },

    /**************
    method: hash
    params: packet
    describe: Access core hash features to build has trail.
    ***************/
    hash(packet) {
      const text = packet.q.text;
      let guid = false
      if (packet.meta.params[1]) guid = true;
      return this.hash(guid, text);
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
    method: uid
    params: packet
    describe: Return system uid for the based deva.
    ***************/
    uid(packet) {
      const newId = `uid: ${this.uid()}`;
      return Promise.resolve(newId);
    },

    /**************
    method: guid
    params: packet
    describe: Return system uid for the based deva.
    ***************/
    guid(packet) {
      const newId = `guid: ${this.uid(true)}`;
      return Promise.resolve(newId);
    },

    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    md5(packet) {
      const hash = `md5: ${this.hash(packet.q.text, 'md5')}`;
      return Promise.resolve(hash);
    },
    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    sha256(packet) {
      const hash = `sha256: ${this.hash(packet.q.text, 'sha256')}`;
      return Promise.resolve(hash);
    },
    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    sha512(packet) {
      const hash = `sha512: ${this.hash(packet.q.text, 'sha512')}`;
      return Promise.resolve(hash);
    },

    /**************
    method: md5 cipher
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    cipher(packet) {
      const data = this.cipher(packet.q.text);
      const cipher = `cipher: ${data.encrypted}`;
      return Promise.resolve(cipher);
    },

    /**************
    method: mem
    params: packet
    describe: Return the current mem for the system deva.
    ***************/
    memory(packet) {
      const free = os.freemem();
      const free_format = `${Math.round(free / 1024 / 1024 * 100) / 100} MB`
      const total = os.totalmem();
      const total_format = `${Math.round(total / 1024 / 1024 * 100) / 100} MB`
      const text = `memory: ${free_format} / ${total_format}`;
      const html = `<p>${text}</p>`;
      const ret = {
        text,
        html,
        data: {
          free,
          total,
        }
      }
      return Promise.resolve(ret);
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

          console.log(help);
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
  }
});

module.exports = {DevaUI};
