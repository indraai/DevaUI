#!/usr/bin/env node

// Copyright (c)2022 Quinn Michaels
// Distributed under the MIT software license, see the accompanying
// file LICENSE.md or http://www.opensource.org/licenses/mit-license.php.

"use strict";

// the deva cli
const path = require('path');
const chalk = require('chalk');

const {version} = require('../../package.json');
const client = require('../../data/client.json').DATA;


const buddy = require('./buddy');

console.log(chalk.greenBright(`
::::::::::::::::::::::::::::::::::

██████╗░███████╗██╗░░░██╗░█████╗░
██╔══██╗██╔════╝██║░░░██║██╔══██╗
██║░░██║█████╗░░╚██╗░██╔╝███████║
██║░░██║██╔══╝░░░╚████╔╝░██╔══██║
██████╔╝███████╗░░╚██╔╝░░██║░░██║
╚═════╝░╚══════╝░░░╚═╝░░░╚═╝░░╚═╝

::::::::::::::::::::::::::::::::::
${chalk.blueBright('version:')} ${chalk.yellowBright(version)}
::::::::::::::::::::::::::::::::::
`));

buddy.init(client);
