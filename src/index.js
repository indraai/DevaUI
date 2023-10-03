// COPYRIGHT (C)2022 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Load DEVA CORE Mind into Deva
const package = require('../package.json');
const info = {
  id: package.id,
  name: package.name,
  version: package.version,
  author: package.author,
  describe: package.description,
  dir: __dirname,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  license: package.license,
  copyright: package.copyright,
};

const os = require('os');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// include deva core
const Deva = require('@indra.ai/deva');

// load data
const {vars, agent} = require('../data');

const DEVA = new Deva({
  info,
  agent,
  vars,
  config: {
    dir: false,
    ports: vars.ports,
  },
  lib: require('./lib'),
  utils: {
    translate(input) {return input.trim();},
    parse(input) {return input.trim();},
    process(input) {return input.trim();}
  },
  devas: require('../devas'),
  listeners: {},
  modules: {
    mind: false,
    psy: [],
  },
  func: {
    cliprompt(packet) {
      let text = packet.text;
      // if (this.vars.labels[packet.value]) text = `${this.vars.labels[packet.value]}:${packet.text}`;
      this.talk('cliprompt', packet.agent); // clears cli line
      console.log(chalk.rgb(packet.agent.prompt.colors.text.R, packet.agent.prompt.colors.text.G, packet.agent.prompt.colors.text.B)(text));
      this.talk('cliprompt', this.client()); // clears cli line
    },

    addHistory(item) {
      this.vars.history.items.push(item)
      if (this.vars.history.items.length > this.vars.history.max_items) {
        const removed = this.vars.history.items.shift();
      }
    },
    /**************
    func: question
    params: packet
    describe: Ask the base deva a question.
    ***************/
    async question(packet) {
      const answer = [];
      const data = {};
      const agent = this.agent();
      return new Promise((resolve, reject) => {
        if (!packet.q.text) return resolve(this._messages.notext);
        this.context('open_chat');
        this.question(`${this.askChr}open chat:${agent.key} ${packet.q.text}`).then(open => {
          data.open = open.a.data;
          this.context('feecting_parse');
          return this.question(`${this.askChr}feecting parse:answer ${open.a.text}`);
        }).then(feecting => {
          data.feecting = feecting.a.data;
          this.context('done');
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data,
          });
        }).catch(reject);
      });
    },

    /**************
    func: devas
    params: packet
    describe: Build a list of devas currently loaded into the system.
    ***************/
    devas(packet) {
      const agent = this.agent();
      return new Promise((resolve, reject) => {
        try {
          const devas = [
            '::begin:menu',
          ];
          for (let deva in this.devas) {
            const {profile,prompt,key} = this.devas[deva].agent();
            devas.push(`button[${prompt.emoji} ${profile.name}]:${this.askChr}${key} help`);
          }
          devas.push(`::end:menu:${this.hash(devas)}`);
          this.question(`${this.askChr}feecting parse ${devas.join('\n')}`).then(parsed => {
            return resolve({
              text:parsed.a.text,
              html:parsed.a.html,
              data:parsed.a.data,
            })
          }).catch(reject)
        } catch (e) {
          return this.error(e, packet, reject);
        }
      });
    },

    lists(item) {
      return new Promise((resolve, reject) => {
        const items = this[item]();
        const _items = [
          `::begin:${items.key}`,
          `## ${items.key}`,
        ];
        for (let item in items.value) {
          console.log('ITEM', item);
          _items.push(`${item}: ${items.value[item]}`);
        }
        _items.push(`::end:${items.key}`);
        this.question(`${this.askChr}feecting parse ${_items.join('\n')}`).then(feecting => {
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data: {
              items,
              feecting: feecting.a.data,
            }
          })
        }).catch(reject)
      });
    }
  },
  methods: {
    /**************
    method: uid
    params: packet
    describe: Return a system id to the user from the Log Buddy.
    ***************/
    uid(packet) {
      const id = this.uid();
      console.log('id', id);
      return Promise.resolve({text:id});
    },

    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    hash(packet) {
      const hash = this.hash(packet.q.text, 'md5');
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
    method: client
    params: packet
    describe: Return the current client information loaded.
    ***************/
    client(packet) {
      const text = `${this._client.prompt.emoji} ${this._client.key} | ${this._client.profile.name} |  ${this._client.id}`;
      return Promise.resolve({text, data:this._client});
    },

    /**************
    method: agent
    params: packet
    describe: Return the current agent information loaded.
    ***************/
    agent(packet) {
      const text = `${this._agent.prompt.emoji} ${this._agent.key} ${this._agent.profile.name} |  ${this._agent.id}`;
      return Promise.resolve({text, data: this._agent});
    },

    /**************
    method: question
    params: packet
    describe: Method to relaty to question function with packet information.
    ***************/
    question(packet) {
      this.zone('deva');
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
    method: states
    params: packet
    describe: Call states function and return list of system states.
    ***************/
    states(packet) {
      return this.func.lists('states');
    },

    /**************
    method: actions
    params: packet
    describe: Call actions function and return list of system actions.
    ***************/
    actions(packet) {
      return this.func.lists('actions');
    },

    /**************
    method: features
    params: packet
    describe: Call features function and return list of system features.
    ***************/
    features(packet) {
      return this.func.lists('features');
    },

    /**************
    method: zones
    params: packet
    describe: Call zones function and return list of system zones.
    ***************/
    zones(packet) {
      return this.func.lists('zones');
    },

    /**************
    method: contexts
    params: packet
    describe: Call contexts function and return list of system contexts.
    ***************/
    contexts(packet) {
      return this.func.lists('contexts');
    },

    /**************
    method: memory
    params: packet
    describe: Return the current memory for the system deva.
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
  },
  async onDone(data) {
    this.listen('devacore:prompt', packet => {
      this.func.cliprompt(packet);
    })

    // load the devas
    for (let x in this.devas) {
      this.prompt(`Load: ${x}`);
      this.load(x, data.client);
    }
    return Promise.resolve(data);
  }
});

module.exports = DEVA;
