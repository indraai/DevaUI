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
        this.context('open_relay');
        this.question(`#open relay ${packet.q.text}`).then(open => {
          data.open = open.a.data;
          answer.push(`::begin:${open.a.agent.key}:${open.id}`);
          answer.push(open.a.text);
          answer.push(`::end:${open.a.agent.key}:${open.hash}`);
          this.context('puppet_relay');
          return this.question(`#puppet relay ${packet.q.text}`);
        }).then(puppet => {
          data.puppet = puppet.a.data;
          answer.push('');
          answer.push(`::begin:${puppet.a.agent.key}:${puppet.id}`);
          answer.push(puppet.a.text);
          answer.push(`::end:${puppet.a.agent.key}:${puppet.hash}`);
          this.context('feecting_parse');
          return this.question(`#feecting parse ${answer.join('\n')}`);
        }).then(feecting => {
          data.feecting = feecting.a.data;
          this.context('done');
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data,
          });
        }).catch(err => {
          return this.error(err, packet, reject);
        });
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
            devas.push(`button[${prompt.emoji} ${profile.name}]:#${key} help`);
          }
          devas.push(`::end:menu:${this.hash(devas)}`);
          this.question(`#feecting parse ${devas.join('\n')}`).then(parsed => {
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
        const states = this[item]();
        const _states = [
          `::begin:${item}`,
          `# ${item}`,
        ];
        for (let x in states.value) {
          _states.push(`${x}: ${states.value[x]} - ${states.messages[x]}`);
        }
        _states.push(`::end:${item}`);
        this.question(`#feecting parse ${_states.join('\n')}`).then(feecting => {
          return resolve({
            text: feecting.a.text,
            html: feecting.a.html,
            data: {
              states,
              feecting: feecting.a.data,
            }
          })
        }).catch(err => {
          return this.error(err, packet, reject);
        })
        return _states.join('\n');
      });

    }
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
    method: question
    params: packet
    describe: Method to relaty to question function with packet information.
    ***************/
    question(packet) {
      this.zone('deva');
      this.context('question');
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
  onDone(data) {
    this.listen('devacore:prompt', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:state', packet => {
      // this.func.cliprompt(packet);
    })
    this.listen('devacore:context', packet => {
      // this.func.cliprompt(packet);
    })
    this.listen('devacore:zone', packet => {
      // this.func.cliprompt(packet);
    })
    this.listen('devacore:feature', packet => {
      // this.func.cliprompt(packet);
    })
    this.listen('devacore:mode', packet => {
      // this.func.cliprompt(packet);
    })
    this.listen('devacore:action', packet => {
      // this.func.cliprompt(packet);
    })

    this.listen('devacore:clearshell', packet => {
      this.func.cliprompt(packet);
    })

    for (let x in this.devas) {
      this.load(x, data.client);
    }
  }
});

module.exports = DEVA;
