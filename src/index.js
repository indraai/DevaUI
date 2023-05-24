// COPYRIGHT (C)2022 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Load DEVA CORE Mind into Deva
const package = require('../package.json');
const info = {
  name: package.name,
  version: package.version,
  author: package.author,
  describe: package.description,
  url: package.homepage,
  git: package.repository.url,
  bugs: package.bugs.url,
  license: package.license,
  copyright: package.copyright
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
  agent: {
    id: 3848019052036,
    key: agent.key,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim().replace(/As an AI language model.+?(\.|\?|\!)\s/gi, '')
                  .replace(/However, I.+?\.\s/gi, '')
                  .replace(/However, I.+?\.\s/gi, '')
                  .replace(/I apologize.+?\.\s/gi, '')
                  .replace(/However,.+?(note)/gi, '$1:')
                  .replace(/p:\s(.+:)?/gi, '$1')
                  .replace(/(\b)OpenAi(\b)/gi, '$1@indra.ai$2');;
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
  devas: {
    log: require('@indra.ai/logdeva'),
    error: require('@indra.ai/errordeva'),
    feecting: require('@indra.ai/feectingdeva'),
    security: require('@indra.ai/securitydeva'),
    support: require('@indra.ai/supportdeva'),
    services: require('@indra.ai/servicesdeva'),
    solutions: require('@indra.ai/solutionsdeva'),
    systems: require('@indra.ai/systemsdeva'),
    development: require('@indra.ai/developmentdeva'),
    business: require('@indra.ai/businessdeva'),
    legal: require('@indra.ai/legaldeva'),
    assistant: require('@indra.ai/assistantdeva'),
    story: require('@indra.ai/storydeva'),
    open: require('@indra.ai/opendeva'),
  },
  listeners: {},
  modules: {
    mind: false,
    psy: [],
  },
  func: {
    cliprompt(packet) {
      let text = packet.text;
      // if (this.vars.labels[packet.value]) text = `${this.vars.labels[packet.value]}:${packet.text}`;
      text = `${text} | ${this.formatDate(packet.creted, 'numeric', true)}`;

      this.talk('cliprompt', packet.agent); // clears cli line
      console.log(chalk.rgb(packet.agent.prompt.colors.label.R, packet.agent.prompt.colors.label.G, packet.agent.prompt.colors.label.B)(text));
      this.talk('cliprompt', this.client()); // clears cli line
    },
    /**************
    func: question
    params: packet
    describe: Ask the base deva a question.
    ***************/
    question(packet) {
      return new Promise((resolve, reject) => {
        if (!packet.q.text) return reject(this._messages.notext);
        this.question(`#open chat ${packet.q.text}`).then(answer => {
          // here is where we apply the deva translate function to remove any open ai specific chat content

          const hashed = this.hash(answer.a.text);
          const translate = this._agent.translate(answer.a.text);
          return this.question(`#feecting parse ${translate}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          });
        }).catch(err => {
          console.log('ERRRRRRR', err);
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
      const devas = [
        '::BEGIN:DEVAS',
        `## ${agent.profile.name}`,
        `total: ${Object.keys(this.devas).length} Devas`,
      ];
      return new Promise((resolve, reject) => {
        try {
          for (let deva in this.devas) {
            const {profile} = this.devas[deva].agent();
            devas.push(`- #${deva}: ${profile.name}`);
          }
          devas.push(`::END:DEVAS:${this.formatDate(Date.now(), 'long', true)}`)
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
      return Promise.resolve(this.uid());
    },

    /**************
    method: guid
    params: packet
    describe: Return system uid for the based deva.
    ***************/
    guid(packet) {
      return Promise.resolve(this.uid(true));
    },

    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    md5(packet) {
      const hash = this.hash(packet.q.text, 'md5');
      return Promise.resolve(hash);
    },
    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    sha256(packet) {
      const hash = this.hash(packet.q.text, 'sha256');
      return Promise.resolve(hash);
    },
    /**************
    method: md5 hash
    params: packet
    describe: Return system md5 hash for the based deva.
    ***************/
    sha512(packet) {
      const hash = this.hash(packet.q.text, 'sha512');
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

    /**************
    method: status
    params: packet
    describe: Return the current status for the system deva.
    ***************/
    status(packet) {
      return this.status();
    },

    /**************
    method: info
    params: packet
    describe: Return the current info for the deva.
    ***************/
    info(packet) {
      const info = [
        '::::::::::::::::::',
        `name: ${this.info.name}`,
        `version: ${this.info.version}`,
        `license: ${this.info.license}`,
        '---',
        `describe: ${this.info.describe}`,
        `author: ${this.info.author}`,
        `url: ${this.info.url}`,
        `git: ${this.info.git}`,
        `bugs: ${this.info.bugs}`,
        `Copyright (c) ${this.info.copyright} ${this.info.author}`,
        ':::::::::::::::::::::::::::',
      ].join('\n')
      return Promise.resolve(info);
    },

    /**************
    method: help
    params: packet
    describe: Return the help files for the main system deva.
    ***************/
    help(packet) {
      return new Promise((resolve, reject) => {
        this.lib.help(packet.q.text, __dirname).then(help => {
          return resolve(help)
        }).catch(err => {
          console.log(err);
        });
      });
    }
  },
  onDone(data) {
    /**************
    func: cli
    params: packet
    describe: this is a forwarding event to the cli interface for other agents.
    ***************/
    this.listen('clirelay', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:prompt', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:state', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:zone', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:feature', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:mode', packet => {
      this.func.cliprompt(packet);
    })
    this.listen('devacore:action', packet => {
      this.func.cliprompt(packet);
    })

    this.listen('devacore:clearshell', packet => {
      this.func.cliprompt(packet);
    })

    for (let x in this.devas) {
      this.load(x, data.client)
    }
  }
});

module.exports = {DEVA};
