// Copyright (c)2022 Quinn Michaels
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Deva = require('@indra.ai/deva');
const ADVENTURE = new Deva({
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
  func: {
    getAdvFile(opts) {
      let advFile, advPath, dir1, dir2
      const thing = opts.meta.params[0];
      const adv = opts.meta.params[1];
      const ident = opts.text.split('/');
      let room = ident[0];
      const sec = ident[1] ? ident[1].split(':') : [];

      room = room.length == 1 ? `000${room}` : room;
      room = room.length == 2 ? `00${room}` : room;
      room = room.length == 3 ? `0${room}` : room;

      const doc = sec[0] ? sec[0].toUpperCase() : 'main';
      const section = sec[1] ? sec[1].toUpperCase() : 'MAIN';

      return new Promise((resolve, reject) => {

      switch (thing) {
        case 'help':
          advPath = path.join(__dirname, 'data', adv, thing, `${data.text}.feecting`);
          this.prompt(`ADV File: ${advPath}`);
          return resolve(fs.readFileSync(advPath, 'utf8'));
        default:
          dir1 = room.substr(0, room.length - 3) + 'xxx';
          dir2 = room.substr(0, room.length - 2) + 'xx';
          advPath = `${this.vars.local}/${adv}/${thing}/${dir1}/${dir2}/${room}/${doc}.feecting`;
          this.prompt(`ADV: ${advPath}`);

          this.prompt(advPath)
          try {
            const _file = fs.readFileSync(advPath)
            const _result = _file.toString('utf8').split(`::BEGIN:${section}`)[1].split(`::END:${section}`)[0];
            return resolve(_result)
          } catch (e) {
            return resolve(`${this.vars.messages.advfile} (${advPath})`);
          }
        }
      });
    },

    view(data) {
      return new Promise((resolve, reject) => {
        this.func.getAdvFile(data.q).then(advFile => {
          return this.question(`#feecting parse:${data.q.meta.params[0]}:${data.q.meta.params[1]} ${advFile}`);
        }).then(parsed => {
          return resolve({
            text: parsed.a.text,
            html: parsed.a.html,
            data: parsed.a.data,
          })
        });
      });
    },
    world(packet) {
      return this.func.view(packet);
    },
    object(packet) {
      return this.func.view(packet);
    },
    agent(packet) {
      return this.func.view(packet);
    },
    hash(packet) {
      return this.hash(packet);
    },
  },
  methods: {
    hash(packet) {
      return this.func.hash(packet);
    },
    world(packet) {
      return this.func.world(packet);
    },
    object(packet) {
      return this.func.object(packet);
    },
    agent(packet) {
      return this.func.agent(packet);
    },
    uid(packet) {
      return Promise.resolve(this.uid());
    },
    status(packet) {
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
    },
  },
});
module.exports = ADVENTURE
