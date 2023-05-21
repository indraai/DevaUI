#!/usr/bin/env node
// COPYRIGHT (c)2023 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Main Deva Agent for deva.world

// setup main variables
const {version, repository} = require('./package.json');
const path = require('path');
const fs = require('fs');
const os = require('os');
const needle = require('needle');

// load agent configuration file
const {vars,agent,client} = require('./data');

const chalk = require('chalk');
const fast = require('fastify')({
  logger:false,
});
const fastStatic = require('@fastify/static');

const readline = require('readline');
const shell = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const clientPrompt = `${client.prompt.emoji} ${client.key}:`;
shell.setPrompt(clientPrompt);
shell.prompt(true);

// set DevaCore objects
const {DevaUI} = require('./src');

// set the base directory in config
DevaUI.config.dir = __dirname;

// get network interfaces
const ipv4 = [];
const networks = os.networkInterfaces();
for (let x in networks) {
  networks[x].forEach(net => {
    let label = '🔶 EXTERNAL';
    if (net.internal) label = '🔷 INTERNAL';
    if (net.family == 'IPv4') ipv4.push(`${label}: http://${net.address}`);
  })
}

const line_break = `░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`;
const devaFlash = (opts) => `
${line_break}
░░██████╗░███████╗██╗░░░██╗░█████╗░░░
░░██╔══██╗██╔════╝██║░░░██║██╔══██╗░░
░░██║░░██║█████╗░░╚██╗░██╔╝███████║░░
░░██║░░██║██╔══╝░░░╚████╔╝░██╔══██║░░
░░██████╔╝███████╗░░╚██╔╝░░██║░░██║░░
░░╚═════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝░░
${line_break}

👤 CLIENT: ${opts.client.profile.name} (${opts.client.id})
👤 AGENT: ${opts.agent.profile.name} (${opts.agent.id})

👨‍💻 REPO: ${repository.url}
❤️ VERSION: ${version}

${line_break}

💹 avail mem: ${os.freemem()}
✅ total mem: ${os.totalmem()}

${line_break}

${opts.ip}
`;

// create the static routes for the local server.
// public is used to deliver local assets
const staticRoutes = [
  {
    root: path.join(__dirname, 'public'),
    prefix: '/public/',
    prefixAvoidTrailingSlash: true,
    list: {
      format: 'json',
      names: ['index', 'index.json', '/', '']
    },
  },
  {
    root: path.join(__dirname, 'data'),
    prefix: '/data/',
    list: {
      format: 'json',
    },
    send: {
      index:'index.json'
    },
    decorateReply: false,
  },
]

// register static routes with the fast server.
staticRoutes.forEach(rt => {
  fast.register(fastStatic, rt);
})

// deliver the default index.html file for the interface.
const routes = [
  {
    method: 'GET',
    url: '/',
    handler: (req,reply) => {
      return reply.sendFile('index.html', path.join(__dirname, 'src', 'ui'));
    },
  },
  {
    method: 'GET',
    url: '/question',
    handler: (req, reply) => {
      if (!req.query.q || !req.query.q.length) return reply.send('💩');
      DevaUI.question(req.query.q).then(answer => {
        // shellPrompt({
        //   prompt: answer.a.agent.prompt,
        //   text: answer.a.text,
        // });
        answer.a.client = answer.a.client.id;
        answer.a.agent = answer.a.agent.id;
        return reply.send(answer.a);
      }).catch(err => {
        console.error('question error', err);
        return reply.send(err);
      });
    }
  },
  {
    method: 'POST',
    url: '/question',
    handler: (req, reply) => {
      // send the question to the shell before askign.
      shellPrompt({
        prompt: client.prompt,
        text: req.body.question,
        type: 'q',
      });
      this.prompt('------ASK DEVA A QUESTION');
      DevaUI.question(req.body.question).then(answer => {
        answer.a.agent = answer.a.data.agent || answer.a.agent;
        this.prompt('SET THE SHELL PROMPT');
        shellPrompt({
          prompt: answer.a.agent.prompt,
          text: answer.a.text,
        });
        this.prompt('QUESTION THE SOCKET TEMRINAL');
        return reply.send(answer);
      }).catch(err => {
        console.error('question error', err);
        return reply.send(err);
      });
    }
  },
  // for mapping the adventure realm images to a public url
  {
    method: 'GET',
    url: '/asset/:adv/:type/:vnum/:asset',
    handler: (req,reply) => {
      const {adv, type, vnum, asset} = req.params;

      const _rpath = client.services.space;
      let assetPath

      const dir1 = vnum.substr(0, vnum.toString().length - 3) + 'xxx';
      const dir2 = vnum.substr(0, vnum.toString().length - 2) + 'xx';
      if (type === 'map') assetPath = `${_rpath}/${adv}/maps/${vnum}/${asset}.png`;
      else assetPath = `${_rpath}/${adv}/${type}/${dir1}/${dir2}/${vnum}/${asset}.png`;

      needle.get(assetPath,{responseType: "arraybuffer"}).then(asset => {
        return reply.type('image/png').send(Buffer.from(asset.data));
      }).catch(err => {
        return reply.send(err)
      })
      // so we need to get images and maps here
    },
  },
]

// register the routes for the server.
routes.forEach(rt => {
  fast.route(rt);
});

// launch fast server to listen to the port rom the vars scope
fast.listen({port:vars.ports.api}).then(() => {
  // log the main server information to the console
  console.log(chalk.green(devaFlash({
    client,
    agent,
    ip: ipv4.map(ip => `${ip}:${vars.ports.api}`).join('\n\r'),
  })));

}).then(_init => {
  // initialize the DevaUI
  DevaUI.init(client);
  DevaUI.listen('cliprompt', text => {
    shell.prompt();
  });

  let cmd = false;

  // run operation when new line item in shell.
  shell.on('line', question => {
    // the event that fires when a new command is sent through the shell.
    if (question === '!exit') return shell.close();

    // ask a question to the deva ui and wait for an answer.
    DevaUI.question(question).then(answer => {
      // sen the necessary returned values to the shell prompt.
      console.log(answer.a.text);
      // if (answer.a.data) console.log(answer.a.data);
      shell.prompt()
    }).catch(e => {
      console.error(e);
    });

  }).on('pause', () => {

  }).on('resume', () => {

  }).on('close', () => {
    // begin close procedure to clear the system and close other devas properly.
    DevaUI.stop().then(stop => {
      stop.client = client;
      console.log(stop.text);
      shell.prompt();
      process.exit(0);
    }).catch(console.error);

  }).on('SIGCONT', () => {
  }).on('SIGINT', data => {
    shell.close();
  }).on('SIGSTOP', () => {});
}).catch(console.error);
