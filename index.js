#!/usr/bin/env node
// COPYRIGHT (C)2021 QUINN MICHAELS. ALL RIGHTS RESERVED.
// Main controller for the Deva user interface. This loads the main source module
//  and the associated Deva with the fast web server static routes.

const {version} = require('./package.json');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

// set DevaCore objects
const {DevaUI} = require('./src');

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

👤 CLIENT: ${opts.client.name}

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
]

// register the routes for the server.
routes.forEach(rt => {
  fast.route(rt);
});

// create the shell promp with proper chalk colors from the passed in options.
function shellPrompt(opts) {
  const {prompt, text} = opts;
  const {colors} = prompt; // set agent prompt colors

  shell.setPrompt(chalk.rgb(colors.label.R, colors.label.G, colors.label.B)(`${prompt.emoji} ${prompt.text.trim()}:`));
  shell.prompt();
  if (text) console.log(chalk.rgb(colors.text.R, colors.text.G, colors.text.B)(text.trim()));
  shell.prompt();
}

// launch fast server to listen to the port rom the vars scope
fast.listen({port:vars.ports.api}).then(() => {
  // log the main server information to the console
  console.log(chalk.green(devaFlash({
    client,
    ip: ipv4.map(ip => `${ip}:${vars.ports.api}`).join('\n\r'),
  })));

}).then(_init => {

  // set the listen for the prompt event and then output here.
  DevaUI.listen('prompt', prompt => {
    shellPrompt(prompt); // set the prompt from passed data
    shellPrompt({prompt:client.prompt}); // reset back to client prompt
  })

  DevaUI.listen('clearshell', () => {
    console.log(vars.messages.clearshell);
  });

  // initialize the DevaUI
  DevaUI.init();

  let cmd = false;

  // run operation when new line item in shell.
  shell.on('line', question => {
    // the event that fires when a new command is sent through the shell.
    if (question === '!exit') return shell.close();

    // ask a question to the deva ui and wait for an answer.
    DevaUI.question(question).then(answer => {
      // sen the necessary returned values to the shell prompt.
      shellPrompt({
        prompt: answer.a.agent.prompt,
        text: answer.a.text,
      });
      // set the shell prompt back to the main agent prompt
      shellPrompt({prompt:client.prompt})
    }).catch(e => {
      console.error(e);
    });

  }).on('pause', () => {

  }).on('resume', () => {

  }).on('close', () => {
    // begin close procedure to clear the system and close other devas properly.
    shell.setPrompt('');
    shell.prompt();

    DevaUI.exit().then(_exit => {
      shellPrompt({
        prompt: client.prompt,
        text: _exit.msg,
      });

      // stop the DevaUI and send the process exit code.
      return DevaUI.stop();
    }).then(_stop => {
      console.log(chalk.red(line_break));
      process.exit(0);
    }).catch(console.error);

  }).on('SIGCONT', () => {
  }).on('SIGINT', data => {
    shell.close();
  }).on('SIGSTOP', () => {});
}).catch(console.error);
