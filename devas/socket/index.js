// Copyright (c)2022 Quinn Michaels
const fs = require('fs');
const path = require('path');

const data_path = path.join(__dirname, 'data.json');
const {agent,vars} = require(data_path).data;

const Socket = require('socket.io');

const Deva = require('@indra.ai/deva');
const SOCKET = new Deva({
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
  listeners: {
    // pass a message to the socket
    'socket'(packet) {
      if (!packet || !this.active) return;
      this.func.emit({say:packet.event, message:packet.data}).then(() => {
        this.talk(`${packet.event}:${packet.id}`, true);
      })
    },
    // broadcast errors to the socket
    'error'(packet) {
      if (!packet || !this.active) return;
      this.func.emit({say:'error', message:packet});
    },
    // pass a message to the socket terminal then talk a response when the socket
    // broadcast is complete from the socketTreminal function.
    'socket:terminal'(packet) {
      if (!packet || !this.active) return;

      this.func.socketTerminal(packet).then(result => {
        this.talk(`socket:terminal:${packet.id}`, true)
      }).catch(err => {
        this.talk('error', {err: err.toString('utf8')});
      });
    },

    // system listenr to broadcast system events to the socket.
    'system'(packet) {
      if (!packet || !this.active) return;
      this.func.systemEvent(packet).then(result => {
        this.talk(`system:${packet.id}`, true)
      }).catch(err => {
        this.talk('error', {err: err.toString('utf8')});
      })
    },
  },
  modules: {
    socket: false,
    server: require('http').createServer(),
  },
  sockets: {},
  deva: {},
  func: {
    socketTerminal(packet) {
      // this is where we emit to the client socket oh yeah
      setImmediate(() => {
        this.modules.socket.to(this.client.uid).emit('socket:terminal', packet);
      });
      // now we get the socket where the client id is.
      return Promise.resolve();
    },
    systemEvent(packet) {
      // this is where we emit to the client socket oh yeah
      packet.data._id = packet.id;
      setImmediate(() => {
        this.modules.socket.to(packet.client.uid).emit(packet.event, packet.data);
      });
      // now we get the socket where the client id is.
      return Promise.resolve();
    },
    emit(opts) {
      this.modules.socket.emit(opts.say, opts.message);
      return Promise.resolve();
    },
  },
  methods: {
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
  onStart() {
    this.modules.socket = Socket(this.modules.server, {
      cors: {
        origin: true,
        methods: ["GET", "POST"],
      }
    });
    this.modules.socket.on('connection', socket => {
      socket
        .on('disconnect', () => {})
        .on('client:data', data => {
          socket.join(data.uid);
        });
    });
    return this.enter();
  },
  onInit() {
    this.prompt(`${this.vars.messages.init} PORT:${this.vars.port}`);
    this.modules.server.listen(this.vars.port);
    return this.start();
  },
});
module.exports = SOCKET
