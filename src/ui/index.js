// Copyright (c)2022 Quinn Michaels
"use strict";
import {io} from 'socket.io-client';

const emojis = {
  weather:'🌦',
  get:'⏬',
  put: '⏫',
  key: '🔑',
  eat: '🥗',
  drink:'🥛',
  pos: '🚹',
  exp: '🪖',
  gift: '🎁',
  gold: '💰',
  points: '💯',
  depart: '🚶',
  arrive: '🚶',
  player: '🧑',
  alert: '🚨',
  trigger: '🔫',
  save: '💾',
  light: '🔦',
  wield: '🔪',
  head: '🧢',
  legs: '🦿',
  feet: '🥾',
  hands: '✋',
  waist: '🥋',
  rwrist: '👉',
  lwrist: '👈',
  body: '👕',
  arms: '🦾',
  shield: '🛡',
  about: '🎒',
  say: '💬',
  door: '🚪',
  info: '💁',
  error: '❌',
  fight: '🥊',
  sound: '🔊',
  pour: '🚰',
};

class DevaInterface {
  constructor() {
    this.client = false;
    this._content = false;
    this.data = false;
    this.log = [];
    this.socket = false;
    this.editing = false;
    this.viewing = false;
    this.viewed = false;
    this.state = 'terminal';
    this.state_prev = false;
    this.adventure = false;
    this.room = false;        // set the current room mud game.
    this.map = false;
    this._shell = [];        // used for keeping track of items in the console.
    this._alerts = [];        // used for keeping track of items in the console.
    this._console = [];        // used for keeping track of items in the console.
  }

  set content(txt) {
    this._content = txt;
  }
  get content() {
    return this._content;
  }

  _insertLog(log) {
    this.log.push(log);
  }

  _setState(state) {
    $('body').removeClass(this.state).addClass(state);
    this.state_prev = this.state;
    this.state = state;
  }

  _logConsole(key,value) {
    if (this._console.length > 25) {
      this._console.shift();
      $('#Console .item').last().remove();
    }
    this._console.push({key,value});
    $('#Console').prepend(`<div class="item ${key.toLowerCase()}">${key}: ${value}</div>`)
  }

  _logShell(opts) {
    if (!opts.text) return;

    if (this._shell.length > 25) {
      this._shell.shift();
      $('#ShellOutput .log-item').first().remove();
    }

    this._shell.push(opts);

    const {type, format, agent, text, data} = opts;
    const {prompt, profile, key} = agent;
    const {colors} = prompt;
    const prompt_color = `rgb(${colors.label.R}, ${colors.label.G}, ${colors.label.B})`;
    const text_color = `rgb(${colors.text.R}, ${colors.text.G}, ${colors.text.B})`;
    let theHtml = `
    <div class="log-item ${type} ${format}">
      <div class="prompt" style="color: ${prompt_color}"><span class="avatar"><img src="${profile.emoji}"/></span><span class="label">${prompt.text}</span></div>
      <div class="text" style="color: ${text_color}">${text}</div>
    </div>`;

    $('#ShellOutput').append(theHtml);
    return setTimeout(() => {
      const so = document.getElementById('ShellOutput');
      if (so) so.scrollTop = so.scrollHeight;
    },250);
  }

  _logBROWSER(opts) {
    const styled = this.content.match(/style=".+;"/);
    if (styled && styled[0]) opts.html = opts.html.replace(styled[0])
    this.content = `<div ${styled && styled[0] ? styled[0] : ''} class="browser-item move-in ${opts.meta.method} ${opts.agent.key}">${opts.html}</div>`;

    return setTimeout(() => {
      this.Show();
    }, 500);
  }

  _logData(data) {
    const _html = [
      `<div class="item datalog">`,
      this._keyValue(data),
      `</div>`,
    ].join('\n');
    $('#System .systembox').html(_html);
  }

  _logAlert(data) {
    if (this._alerts.length > 25) {
      this._alerts = [];
      $('#Alerts .item').last().remove();
    }
    this._alerts.unshift(data);

    const { label, text } = data.agent.prompt.colors;
    const _html = [
      `<div class="item alert" data-id="${data.id}">`,
      `<span class="label" style="color:rgb(${label.R},${label.G},${label.B})">`,
      `${data.agent.prompt.emoji} #${data.agent.key}:`,
      '</span>',
      `<span class="value" style="color: rgb(${text.R}, ${text.G}, ${text.B})">`,
      `${data.text}`,
      '</span>',
      '</div>'
    ].join('');
    $('#Alerts').prepend(_html);
  }

  _scrollTop(elem) {
    return setTimeout(() => {
      const so = document.getElementById(elem);
      so.scrollTop = 0;
    }, 100);
  }

  Question(q, log=true) {

    if (log) this._logShell({
      type: 'question',
      format: 'terminal',
      text: q,
      agent: this.client,
    });

    return new Promise((resolve, reject) => {
      // this.Clear(q);
      axios.post('/question', {
        question: q,
      }).then(response => {
        const answer = response.data;
        this._logData({[answer.id]: answer});
        return this.processor(answer.a);
      }).catch(err => {
        console.log('error', err);
        return reject(err);
      });
    });
  }

  Log() {
    return Promise.resolve(this._formatLog());
  }

  // the keyvalue pair processor for output into html of recursive structures.
  _keyValue(obj) {
    // create html key pair format
    const output = [];
    for (let key in obj) {
      const v = obj[key];
      if (typeof v === 'object') {
        output.push(`<div class="child"><div class="key">${key}</div><div class="values">${this._keyValue(v)}</div></div>`);
      }
      else if(Array.isArray(v)) {
        v.forEach((av,idx) => {
          output.push(`<div class="row"><div class="value">${idx}. ${av}</div></div>`);
        });
      }
      else {
        let _temp = v;
        if (_temp && _temp.toString().startsWith('/')) _temp = `<button class="jump" data-data="${v}">${v}</button>`;
        output.push(`<div class="row"><div class="key">${key}:</div><div class="value">${_temp}</div></div>`);
      };
    }
    return output.join('\n');
  }


  // load key value pair objects into the this scope and output to a data container
  GetKeyPair(opts) {
    this[opts.var] = opts.data;
    this.content =`<div class="DataContainer" id="${opts.id}"><h1>${opts.var}</h1>${this._keyValue(opts.data)}</div>`;
  }

  Client(data) {
    if (this.client) return;

    this.client = data;
    console.log('SETTING THIS CLIENT', this.client);

    this.GetKeyPair({
      data,
      id: 'Client',
      var: 'client'
    })
    this.Show();

    const shell = document.getElementById('q');
    const label = document.getElementById('ShellInputLabel');
    const {prompt} = this.client;
    const {colors} = prompt;
    if (shell) {
      shell.style.color = `rgb(${colors.text.R}, ${colors.text.G}, ${colors.text.B})`;
    }
    if (label) {
      label.style.color = `rgb(${colors.label.R}, ${colors.label.G}, ${colors.label.B})`;
      label.innerHTML = `${prompt.emoji} ${prompt.text}`;
    }

  }

  Show() {
    $('#Content').html(this.content);
    setTimeout(() => {
      const so = document.getElementById('Content');
      so.scrollTop = 0;
    }, 250)
    return Promise.resolve(true);
  }

  docs(data) {
    console.log('DOCS DATA', data);
    if (data.meta.method === 'view') this._logBROWSER(data);
    this._logShell({
      type: data.meta.key,
      method: data.meta.method,
      agent: data.agent,
      maeta: data.meta,
      text: data.html ? data.html : data.text,
    });

  }

  processor(data) {
    console.log('PROCESSING', data);
    if (!data.text) return;
    const { meta } = data;
    const metaKey = meta.key;
    // here in the processor we want to check for any strings that also match from the first index.
    const metaChk = this[metaKey] && typeof this[metaKey] === 'function';
    const helpChk = meta.method === 'help';

    if (helpChk) return this._logBROWSER(data);
    else if (metaChk) return this[meta.key](data);
    // editor
    else return this._logShell({
      type: data.meta.key,
      format: data.meta.method,
      agent:data.agent,
      meta: data.meta,
      text: data.html ? data.html : data.text,
    });

    // if (!data.a.text && !data.a.html) return;
    // if (!data.a.meta) return this.general(data);
    // const type = data.a.meta.type ? data.a.meta.type : false;
    // if (typeof this[type] === 'function') return this[type](data);
    //
    // const states = ['connected', 'editor']
    // if (data.state && states.includes(data.state.key)) this._setState(data.state.key);
    // if (this.state === 'editor') return this.general(data);
    //
    //
  }


  Init(socket) {
    return new Promise((resolve, reject) => {
      this.socket = socket;

      $('body').on('click', '.child > .key', e => {
        $(e.target).toggleClass('open');

      // the event handler for the data-cmd elements.
      }).on('click', '[data-cmd]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-cmd]').data('cmd');
        this.Question(cmd);
      }).on('click', '[data-button]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-button]').data('button')
        this.Question(cmd, false);
      });

      $('#Shell').on('submit', e => {
        e.stopPropagation()
        e.preventDefault();
        const question = $('#q').val();
        this.Question(question).catch(console.error);
        $('#q').val('');
      });


      // emit the socket event for the client data
      socket.on('socket:clientdata', data => {
        this.Client(data);
      })
      socket.on('socket:devacore', data => {
        console.log('DEVA CORE SOCKET', data);
        if (data.key === 'context') {
          this._logAlert({
            type: data.value,
            format: data.key,
            agent:data.agent,
            meta: false,
            text: data.text,
          });
        }
        else if (data.key === 'prompt') {
          this._logShell({
            type: data.value,
            format: data.key,
            agent:data.agent,
            meta: false,
            text: data.text,
          });
        }
        else {
          this._logConsole(data.agent.key, data.text)
        }
      });

      return resolve();
      // // setup client then trap the system events
      // this.Client().then(() => {
      //   socket.on('socket:clientdata', data => {
      //     // log the data packet to the ui
      //     console.log('SOCKET TERMINAL DATA', data);
      //     // if (data.a.data) this._logData({
      //     //   [data.id]: {
      //     //     agent:data.a.agent,
      //     //     client:data.a.client,
      //     //     meta:data.a.meta,
      //     //     data:data.a.data,
      //     //   }
      //     // });
      //     // return this.processor(data);
      //   });
      //
      //   return resolve();
      //
      // }).catch(reject);
    });
  }
}

const socket = io('http://localhost:9301');
const Deva = new DevaInterface();
Deva.Init(socket);






//
//
//
//
//
// $('body').on('click', '.child > .key', e => {
//   $(e.target).toggleClass('open');
// }).on('click', '#SNACK_TIME > h1', e=> {
//   $('body').removeClass('snack-time');
// });
