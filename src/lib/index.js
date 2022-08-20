// Copyright (c)2022 Quinn Michaels
// Distributed under the MIT software license, see the accompanying
// file LICENSE.md or http://www.opensource.org/licenses/mit-license.php.

const path = require('path');
const fs = require('fs');
const He = require('he');
// local function to handle recursive copying
function copy(obj) {
  let v, key;
  const output = Array.isArray(obj) ? [] : {};
  for (key in obj) {
      v = obj[key];
      output[key] = (typeof v === "object") ? copy(v) : v;
  }
  return output;
}

function copyCode(obj) {
  let value, key;
  const output = {};
  for (key in obj) {
    output[key] = typeof obj[key] === "object" ? obj[key] : String(obj[key]);
  }
  return JSON.stringify(output, null, 2);
}

class Node {
  constructor(opts) {
    for (let opt in opts) this[opt] = opts[opt];
  }
}

module.exports = {
  Node,
  getToday(d) {
    d = d ? d : Date.now();
    const today = new Date(d);
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    return today.getTime();
  },

  copy(obj) {
    return copy(obj)
  },

  copyCode(obj) {
    return copyCode(obj)
  },

  decode(content) {
    return He.decode(content);
  },

  formatDate(d, format='long', time=false, locale='en-US') {
    if (!d) d = Date.now();
    d = new Date(d);

    const formats = {
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      long_month: { year: 'numeric', month: 'long', day: 'numeric'},
      short: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
      short_month: { year: 'numeric', month: 'short', day: 'numeric' },
      year: { year: 'numeric' },
      month: { month: 'long' },
      day: { day: 'long' }
    };
    const theDate = d.toLocaleDateString(locale, formats[format]);
    const theTime = d.toLocaleTimeString(locale);

    if (format === 'time') return theTime;

    return !time ? theDate : `${theDate} - ${theTime}`;
  },

  formatCurrency(n, lang='en-US', currency='USD') {
    return new Intl.NumberFormat(lang, { style: 'currency', currency }).format(n);
  },

  formatPercent(n, dec=2) {
    return parseFloat(n).toFixed(dec) + '%';
  },

  trimText(text, len) {
    let strLen = 0
    const splitter = text.split(' ');
    if (text.length < len) return text;
    return splitter.filter(wrd => {
      strLen = strLen + wrd.length;
      return strLen < len;
    }).join(' ');
  },

  // remove duplicates from an array.
  dupes(dupers) {
    if (!Array.isArray(dupers)) return dupers;
    const check = [];
    return dupers.filter(dupe => {
      if (!check.includes(dupe)) {
        check.push(dupe);
        return dupe;
      }
    });
  },
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
