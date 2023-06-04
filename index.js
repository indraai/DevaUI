#!/usr/bin/env node
// COPYRIGHT (c)2023 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Main Deva Agent for deva.world

// setup main variables
const package = require('./package.json');
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

const DEVA = require('./src'); // set the deva object
DEVA.config.dir = __dirname; // set the base config directory

function setPrompt(pr) {
  // console.log('PROMPT', pr);
  shell.prompt();
  if (!pr) return;
  else if (!pr.prompt) return;
  else {
    const {colors} = pr.prompt;
    const setPrompt = chalk.rgb(colors.label.R, colors.label.G, colors.label.B)(`${pr.prompt.emoji} #${pr.prompt.text}:`);

    // const setPrompt = `${pr.prompt.emoji} ${pr.key}: `;
    shell.setPrompt(setPrompt);
    shell.prompt();
  }
}

function devaQuestion(q) {
  // the event that fires when a new command is sent through the shell.
  if (q.toLowerCase() === '/exit') return shell.close();

  return new Promise((resolve, reject) => {
    // ask a question to the deva ui and wait for an answer.
    DEVA.question(q).then(answer => {
      // sen the necessary returned values to the shell prompt.
      setPrompt(answer.a.agent);
      console.log(chalk.rgb(answer.a.agent.prompt.colors.text.R, answer.a.agent.prompt.colors.text.G, answer.a.agent.prompt.colors.text.B)(answer.a.text));
      setPrompt(answer.a.client);
      // if (answer.a.data) console.log(answer.a.data);
      resolve(answer);
    }).catch(e => {
      reject(e);
    });
  });
}

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

👤 CLIENT:    ${opts.client.profile.name} (${opts.client.id})
👤 AGENT:     ${opts.agent.profile.name} (${opts.agent.id})

📛 name:      ${package.name},
💚 ver:       ${package.version},
✍️  author:     ${package.author},
📝 describe:  ${package.description},
🔗 url:       ${package.homepage},
👨‍💻 git:       ${package.repository.url}
🪪 license:    ${package.license}

${line_break}

${opts.ip}

💹 avail mem:   ${os.freemem()}
✅ total mem:   ${os.totalmem()}

Copyright ©${package.copyright}
${line_break}`;

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
    method: 'POST',
    url: '/question',
    handler: (req, reply) => {
      devaQuestion(req.body.question).then(answer => {
        return reply.type('json').send(answer);
      }).catch(e => {
        return reply.send('THERE WAS AN ERROR')
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
  // initialize the DEVA
  setPrompt(client);
  DEVA.init(client).then();

  // cli prompt listener for relaying from the deva to the prompt.
  DEVA.listen('cliprompt', ag => {
    setPrompt(ag);
  });

  // run operation when new line item in shell.
  shell.on('line', question => {
    devaQuestion(question);
  }).on('pause', () => {

  }).on('resume', () => {

  }).on('close', () => {
    // begin close procedure to clear the system and close other devas properly.
    DEVA.stop().then(stop => {
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
