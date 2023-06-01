// Copyright (c)::year:: ::copyright::
// ::name::

const fs = require('fs');
const path = require('path');
const Deva = require('@indra.ai/deva');

const package = require('../../package.json');
const info = {
  id: package.id,
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

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).DATA;

const ::key-upper:: = new Deva({
  info,
  agent: {
    id: agent.id,
    key: agent.key,
    prompt: agent.prompt,
    voice: agent.voice,
    profile: agent.profile,
    translate(input) {
      return input.trim();
    },
    parse(input) {
      return input.trim();
    },
    process(input) {
      return input.trim();
    },
  },
  vars,
  listeners: {},
  modules: {},
  devas: {},
  func: {},
  methods: {
    /**************
    method: uid
    params: packet
    describe: Return a system id to the user from the :name:.
    ***************/
    uid(packet) {
      this.context('uid');
      const guid = packet.q.meta.params[1] ? true : false
      return Promise.resolve(this.uid(guid));
    },

    /**************
    method: status
    params: packet
    describe: Return the current status of the :name:.
    ***************/
    status(packet) {
      this.context('status');
      return Promise.resolve(this.status());
    },

    /**************
    method: help
    params: packet
    describe: Return the help files for the main system deva.
    ***************/
    help(packet) {
      this.context('help');
      return new Promise((resolve, reject) => {
        this.help(packet.q.text, __dirname).then(help => {
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
module.exports = ::key-upper::
