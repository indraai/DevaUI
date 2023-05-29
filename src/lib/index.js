// Copyright (c)2022 Quinn Michaels
// Distributed under the MIT software license, see the accompanying
// file LICENSE.md or http://www.opensource.org/licenses/mit-license.php.

const path = require('path');
const fs = require('fs');

class Node {
  constructor(opts) {
    for (let opt in opts) this[opt] = opts[opt];
  }
}

module.exports = {
  Node,
  // HELP FUNCTION TO ACCESS THE HELP MARKDOWN FILES.
  help(msg, help_dir) {
    return new Promise((resolve, reject) => {
      const params = msg.split(' ');
      let helpFile = 'main';
      if (params[0]) helpFile = params[0];
      if (params[1]) helpFile = `${params[0]}_${params[1]}`;
      helpFile = path.join(help_dir, 'help', `${helpFile}.feecting`);
      try {
        return resolve(fs.readFileSync(helpFile, 'utf8'))
      } catch (e) {
        return reject(e)
      }
    });
  },
};
