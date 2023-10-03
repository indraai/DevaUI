// Copyright (c)2022 Quinn Michaels
"use strict";
import {io} from 'socket.io-client';

class DevaInterface {
  constructor() {
    this.client = false;
    this._content = false;
    this.socket = false;
    this._shell = [];        // used for keeping track of items in the console.
    this._console = {
      context: [],
      state: [],
      action: [],
      feature: [],
      zone: [],
      alerts: [],
    }
    this._features = [
      'security',
      'support',
      'services',
      'systems',
      'solutions',
      'development',
      'research',
      'business',
      'legal',
      'assistant',
    ];
    this.history_count = 50;
  }

  set content(txt) {
    this._content = txt;
  }
  get content() {
    return this._content;
  }

  logPanel(data) {
    if (!this._console[data.key]) return;
    const selector = `.event-panel.${data.key}`;
    const {colors} = data.agent.prompt;
    const html = [
      `<div class="item ${data.key} ${data.value}" data-id="${data.id}" data-hash="${data.hash}">`,
      `<span class="emoji"><img src="${data.agent.profile.emoji}"></span>`,
      `<span class="label" style="color:rgb(${colors.label.R},${colors.label.G},${colors.label.B});">#${data.agent.key}</span>`,
      `<span class="text" style="color:rgb(${colors.text.R},${colors.text.G},${colors.text.B});">${data.text}<span>`,
      '</div>',
    ].join('\n');

    if (this._console[data.key].length > this.history_count) {
      this._console[data.key].shift();
      $(`${selector} .item`).last().remove();
    }
    this._console[data.key].push(data);
    $(selector).prepend(html)
  }

  logConsole(opts) {
    if (!opts.text) return;

    if (this._shell.length > this.history_count) {
      this._shell.shift();
      $('#ConsoleItems .item').first().remove();
    }

    this._shell.push(opts);

    const {type, format, agent, text, data} = opts;
    const {prompt, profile, key} = agent;
    const {colors} = prompt;
    const prompt_color = `rgb(${colors.label.R}, ${colors.label.G}, ${colors.label.B})`;
    const text_color = `rgb(${colors.text.R}, ${colors.text.G}, ${colors.text.B})`;
    let theHtml = `
    <div class="item ${type} ${format}">
      <div class="person" style="color: ${prompt_color}"><span class="avatar"><img src="${profile.emoji}"/></span><span class="agent">${prompt.text}</span></div>
      <div class="text" style="color: ${text_color}">${text}</div>
    </div>`;

    $('#ConsoleItems').append(theHtml);
    return setTimeout(() => {
      const so = document.getElementById('ConsoleItems');
      if (so) so.scrollTop = so.scrollHeight;
    }, 250);
  }

  _logData(data) {
    const _html = [
      `<div class="item datalog">`,
      this._keyValue(data),
      `</div>`,
    ].join('\n');
    $('#DataPanel .databox').html(_html);
  }

  _logAlert(data) {
    if (this._alerts.length > this.history_count) {
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

    if (log) this.logConsole({
      type: 'question',
      format: 'client',
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
    const content =`<div class="DataContainer" id="${opts.id}"><h1>${opts.var}</h1>${this._keyValue(opts.data)}</div>`;
    this.Show(content)
  }

  Client(data) {
    if (this.client) return;

    this.client = data;
    console.log('SETTING THIS CLIENT', this.client);

    this.GetKeyPair({
      data,
      id: 'Client',
      var: 'client'
    });

    const shell = document.getElementById('Prompt');
    const label = document.getElementById('PromptLabel');
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

  Show(html) {
    $('#Viewer').html(html);
    const so = document.getElementById('Viewer');
    so.scrollTop = 0;
    return Promise.resolve(true);
  }

  async data(packet) {
    if (packet.meta.method === 'history') {
      const data = packet.data.reverse();
      for (let x of data) {
        this.logConsole({
          type: x.q.meta.key,
          method: x.q.meta.method,
          agent: x.q.client,
          meta: x.q.meta,
          text: x.q.html ? x.q.html : x.q.text,
        });
        this.logConsole({
          type: x.a.meta.key,
          method: x.a.meta.method,
          agent: x.a.agent,
          meta: x.a.meta,
          text: x.a.html ? x.a.html : x.a.text,
        });
        console.log('DATA', x);
      }
      return;
    }

    return this.logConsole({
      type: packet.meta.key,
      method: packet.meta.method,
      agent: packet.agent,
      maeta: packet.meta,
      text: packet.html ? packet.html : packet.text,
    });
  }
  docs(data) {
    console.log('DOCS DATA', data);
    if (data.meta.method === 'view') {
      if (data.meta.params[1] && data.meta.params[1] === 'panel') $('#Panel').html(data.html)
      else this.Show(data.html);
      return;
    }
    this.logConsole({
      type: data.meta.key,
      method: data.meta.method,
      agent: data.agent,
      maeta: data.meta,
      text: data.html ? data.html : data.text,
    });
  }
  space(data) {
    console.log('DOCS DATA', data);
    if (['agent','object','place'].includes(data.meta.method)) {
      return this.Show(data.html);
    }
    this.logConsole({
      type: data.meta.key,
      method: data.meta.method,
      agent: data.agent,
      maeta: data.meta,
      text: data.html ? data.html : data.text,
    });
  }

  veda(data) {
    console.log('DOCS DATA', data);
    if (data.meta.method === 'hymn') return this.Show(data.html);

    const {colors} = data.agent.prompt;
    const panel = document.getElementById('Panel');
    panel.style.color = `rgb(${colors.text.R}, ${colors.text.G}, ${colors.text.B})`;
    panel.innerHTML = data.html;
    return;
  }

  youtube(data) {
    console.log('YOUTUBE DATA', data);
    switch (data.meta.method) {
      case 'chats':
        $('#Panel').append(data.html)
        break;
      default:
        this.logConsole({
          type: data.meta.key,
          method: data.meta.method,
          agent: data.agent,
          maeta: data.meta,
          text: data.html ? data.html : data.text,
        });
    }
  }

  feature(data) {
    this.Show(data.html);
  }

  services(data) {}

  processor(data) {
    if (!data.text) return;
    const { meta } = data;
    const metaKey = meta.key;
    // here in the processor we want to check for any strings that also match from the first index.
    const metaChk = this[metaKey] && typeof this[metaKey] === 'function';
    const helpChk = meta.method === 'help';
    const featureChk = this._features.includes(meta.method);

    if (helpChk) return this.Show(data.html);
    else if (featureChk) return this.feature(data);
    else if (metaChk) return this[meta.key](data);
    // editor
    else return this.logConsole({
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
      }).on('click', '[data-prompt]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-tty]').data('tty');
        $('#Prompt').val(cmd);
        document.getElementById('Prompt').focus();
      }).on('click', '[data-button]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-button]').data('button')
        this.Question(cmd, false);
      });

      $('#PromptForm').on('submit', e => {
        e.stopPropagation();
        e.preventDefault();
        const question = $('#Prompt').val();
        this.Question(question).catch(console.error);
        $('#Prompt').val('');
      });

      // emit the socket event for the client data
      socket.on('socket:clientdata', data => {
        this.Client(data);
      });


      socket.on('socket:global', data => {
        return this.processor(data.a);
      });

      socket.on('socket:devacore', data => {
        this.logPanel(data)
      });
      return resolve();
    });
  }
}

const socket = io('http://localhost:9301');
const Deva = new DevaInterface();
Deva.Init(socket);
