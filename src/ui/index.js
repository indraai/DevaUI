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
    this.content = false;
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
    this.console = [];        // used for keeping track of items in the console.
  }

  _insertLog(log) {
    this.log.push(log);
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

  _setState(state) {
    $('body').removeClass(this.state).addClass(state);
    this.state_prev = this.state;
    this.state = state;
  }

  _console(key,value) {
    if (this.console.length > 20) {
      this.console = [];
      $('#MudConsole').html('');
    }
    this.console.push({key,value});
    $('#MudConsole').prepend(`<div class="item ${key.toLowerCase()}">${emojis[key.toLowerCase()]} ${value}</div>`)
  }

  _logSHELL(opts) {

  if (!opts.text) return;
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
    const text = opts.text.replace(/\n\r/g, '<br/>').replace(/<div class="line">&gt;<\/div>/g, '');
    const styled = opts.html.match(/style=".+;"/);
    if (styled && styled[0]) opts.html = opts.html.replace(styled[0])
    let theHtml = `<div ${styled && styled[0] ? styled[0] : ''} class="browser-item move-in ${opts.meta.method} ${opts.agent.key}">${opts.html}</div>`;
    $('#Content .browser-item').removeClass('north south east west up down northwest northeast southwest southeast move-in').addClass(`move-out ${opts.meta.method}`);
    return setTimeout(() => {
      $('#Content').html(theHtml);
      this._scrollTop('Content');
    }, 500)
  }

  _logData(data) {
    const _html = [
      `<div class="item datalog">`,
      this._keyValue(data),
      `</div>`,
    ].join('\n');
    $('#MudSystem .systembox').html(_html);
  }


  _scrollTop(elem) {
    return setTimeout(() => {
      const so = document.getElementById(elem);
      so.scrollTop = 0;
    }, 100);
  }

  Question(q, log=true) {
    this._insertLog({type:'question', text:q, agent:this.client});

    if (log) this._logSHELL({
      type: 'question',
      format: 'terminal',
      text: q,
      agent: this.client,
    });

    return new Promise((resolve, reject) => {
      this.Clear(q);
      axios.post('/question', {
        question: q,
      }).then(answer => {
        console.log('answer', answer);
        return resolve(answer);
      }).catch(err => {
        console.log('error', err);
        return reject(err);
      });
    });
  }

  Command(text, log=true) {
    const q = document.getElementById('q');
    if (!q) return Promise.resolve();
    q.focus();
    return this.Question(text, log).catch(console.error);
  }

  Log() {
    return Promise.resolve(this._formatLog());
  }

  // load key value pair objects into the this scope and output to a data container
  GetKeyPair(opts) {
    return new Promise((resolve, reject) => {
      axios.get(opts.path).then(result => {
        this[opts.var] = result.data.DATA;
        this.content =`<div class="DataContainer" id="${opts.id}"><h1>${opts.var.toUpperCase()}</h1>${this._keyValue(result.data)}</div>`;
        return resolve();
      }).catch(reject);
    });
  }

  Client(_path='/data/client.json') {
    return new Promise((resolve, reject) => {
      // get the client data and load it into the key value pair this scope.
      this.GetKeyPair({
        path: _path,
        id: 'Client',
        var: 'client'
      }).then(result => {
        // setup the form display for the agent
        this.Show('client');
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
        return resolve(true);
      });
    })
  }

  Data(_path='/data/index.json') {
    return new Promise((resolve, reject) => {
      this.GetKeyPair({
        path: _path,
        id: 'Data',
        var: 'data',
      }).then(result => {
        this.Show('data');
      })
    });
  }

  Devas(deva='') {
    return new Promise((resolve, reject) => {
      this.GetKeyPair({
        path: `/devas/${deva}`,
        id: 'DevasData',
        var: 'devas'
      }).then(result => {
        this.Show('devas');
      }).catch(reject)
    });
  }

  View(doc='main') {
    return new Promise((resolve, reject) => {
      this.GetFeecting({
        path: doc,
        id: 'ViewData',
        var: 'view',
      }).then(result => {
        this.Show('view');
        return resolve(true);
      }).catch(reject);
    })
  }

  Show(area) {
    $('#Content').html(this.content);
    setTimeout(() => {
      const so = document.getElementById('Content');
      so.scrollTop = 0;
    }, 250)
    return Promise.resolve(true);
  }

  deva(data) {
    $('#MudAlerts').prepend(`<div class="deva alert">${data.text}</div>`);
  }

  // parses coordinates from a string
  coordinates(txt, adv) {
    const coord = /coordinates:(.+)\[(.+)\|(.+)\]/g;
    const coordinates = coord.exec(txt);
    if (!coordinates) return;
    const nameS = coordinates[1].split('-');
    const name = nameS && nameS[1] ? nameS[1] : 'main';
    const _map = `/asset/${adv}/map/${nameS[0]}/${name}`;
    if (_map !== this.map) {
      this.map = _map;
      $('.controls').css({'background-image': `url(${this.map})`});
    }
    $('.controls').css({'background-position': `${coordinates[2]}px ${coordinates[3]}px`});
    return;
  }

  patterns(data) {
    const trigger = data.state.split(':')[0].toLowerCase();
    const self = this;
    const triggers = {
      room(data) {
        $('#WatchRoom').html(`<span>${data.text}</span>`);
        return;
      },
      bars(opts) {
        let {bid, bclass, bmin, bmax} = opts;
        let bar = Math.floor((bmin / bmax) * 100);
        if (bar > 100) bar = 100

        if (bar < 30) bclass += ' warning';
        if (bar < 15) bclass += ' alert';
        $(`#${bid} .bar`).removeClass('warning').removeClass('alert').addClass(bclass).attr('style', `--bar-width: ${bar}%;`);
      },
      hit(data) {
        this.bars({
          bid: 'MudStatsHit',
          bclass: 'hit',
          bmin: data.pattern.matched[2],
          bmax: data.pattern.matched[3],
        });
      },
      mana(data) {
        this.bars({
          bid: 'MudStatsMana',
          bclass: 'mana',
          bmin: data.pattern.matched[2],
          bmax: data.pattern.matched[3],
        });
      },

      move(data) {
        this.bars({
          bid: 'MudStatsMove',
          bclass: 'mana',
          bmin: data.pattern.matched[2],
          bmax: data.pattern.matched[3],
        });
      },

      hunger(data) {
        this.bars({
          bid: 'MudStatsHunger',
          bclass: 'hunger',
          bmin: data.pattern.matched[2],
          bmax: data.pattern.matched[3],
        });
      },

      thirst(data) {
        this.bars({
          bid: 'MudStatsThirst',
          bclass: 'hunger',
          bmin: data.pattern.matched[2],
          bmax: data.pattern.matched[3],
        });
      },

      equipment(data) {
        const equip = (/equipment:(.+):(.+)/g).exec(data.text);
        $('#MudEquipment').append(`<div class="item equipment">${emojis[equip[1].toLowerCase()]} ${equip[2]}</div>`);
      },

      inventory(data) {
        $('#MudInventory').append(`<div class="item inventory">${data.pattern.matched[2]}</div>`);
      },

      current(data) {
        $('#q').val(data.text.replace(/\ncurrent:\s?(.+)/, `#mud > $1`));
        document.getElementById('q').focus();
      },

      fight(data) {
        const {matched} = data.pattern;
        $('#MudAlerts').prepend(`<div class="item fight">${emojis[matched[1].toLowerCase()]} ${matched[2]}</div>`);
      },

      save(data) {
        $('#ShellOutput').html('')
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },

      info(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },

      error(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },

      alert(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      door(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      player(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      arrive(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      depart(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      gold(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      exp(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      pos(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      key(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      drink(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      eat(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      put(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      get(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      weather(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      pour(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      trigger(data) {
        const {matched} = data.pattern;
        return self._console(matched[1],matched[2]);
      },
      time(data) {
        const {matched} = data.pattern;
        const time = matched[2].split(':');
        const hour = time[0] < 10 ? `0${time[0]}` : time[0];
        const minute = time[1] < 10 ? `0${time[1]}` : time[1];
        $('#WatchHour').html(`<span>${hour}:${minute}</span>`);
      },
      date(data) {
        const {matched} = data.pattern;
        const DoW = matched[2].split(' - ');
        $('#WatchDay').html(`<span>${DoW[0].trim()}</span>`);
        $('#WatchDate').html(`<span>${DoW[1].trim()}</span>`);
      },
      gui(data) {
        // split the gui command from string
        const parse = data.text.split(':');
        const label = parse.shift();
        const cmd = parse.length > 1 ? parse.join(':') : parse[0];
        self.Question(cmd, false);
      }
    }
    if (triggers[trigger] && typeof triggers[trigger] === 'function') return triggers[trigger](data);
    const split_for_emoji = data.text.split(':');
    const the_emoji = split_for_emoji.shift().toLowerCase().trim();
    const _emoji = emojis[the_emoji];
    if (_emoji) data.text = `${_emoji} ${split_for_emoji.join(':')}`;
    $('#MudAlerts').prepend(`<div class="item alert">${data.text}</div>`);
  }

  environment(data) {
    $('#MudEnvironment').prepend(data.html)
  }

  navigate(data) {
    this.Clear();
    this._logBROWSER(data);
    setTimeout(() => {
      this.Question(`#mud exits`, false);
    }, 1000);
  }

  goto(data) {
    return this.navigate(data);
  }

  read(data) {
    $('#Content').html(`<div class="browser-item read">${data.html}</div>`);
  }

  canvas(data) {
    this._logBROWSER(data.a);
  }

  terminal(data) {
    this._logSHELL({
      key:data.meta.key,
      format: data.meta.format,
      text:data.html ? data.html : data.text,
      agent: data.agent || this.client,
    });
  }

  twitter(data) {
    const theHTML = []
    this._logSHELL({
      key: data.a.meta.key,
      format: data.a.meta.method,
      text: data.a.html || data.a.text,
      agent:data.a.agent,
    });
  }

  reddit(opts) {
    this._logBROWSER(opts.a);
  }

  docs(opts) {
    this._logBROWSER(opts.a);
  }

  voice(opts) {
    const {meta, html, text, agent} = opts.a;

    if (meta.method === 'tts') {
      $('#MudAlerts').prepend(`<div class="item audio">${html}</div>`);
    }
    else {
      this._logSHELL({
        type: meta.key,
        format: meta.method,
        agent:agent,
        meta: meta,
        text: html ? html : text,
      });
    }
  }

  pandora(opts) {
    console.log('PANDORA', opts);
    if (opts.a.meta.method === 'ask') {
      const split_for_emoji = opts.a.text.split(':');
      const the_emoji = split_for_emoji.shift().toLowerCase().trim();
      const _emoji = emojis[the_emoji];
      if (_emoji) opts.a.text = `${_emoji} ${split_for_emoji.join(' ')}`;
      $('#MudAlerts').prepend(`<div class="item alert">${opts.a.text}</div>`);
    }
    else  {
      return this._logSHELL({
        type: opts.a.meta.key,
        format: opts.a.meta.method,
        agent:opts.a.agent,
        meta: opts.a.meta,
        text: opts.a.html ? opts.a.html : opts.a.text,
      });
    }
  }

  mud(opts) {
    const self = this;
    const {method} = opts.a.meta;
    const mudder = {
      help(opts) {
        self._logBROWSER(opts);
      },
      wizhelp(opts) {
        self._logBROWSER(opts);
      },

      terminal(opts) {
        return self._logSHELL({
          agent: opts.agent,
          type: opts.meta.key,
          format: opts.meta.method,
          text: opts.html ? opts.html : opts.text,
        });
      },

      goto(opts) {
        return self.navigate(opts);
      },

      look(opts) {
        return self.navigate(opts);
      },

      where(opts) {
        return self._logSHELL({
          agent: opts.agent,
          type: opts.meta.key,
          format: opts.meta.method,
          text: opts.html || opts.text,
        })
      },

      exits(opts) {
        const exits = opts.text.split('\n');

        exits.forEach(ex => {
          const bt = ex.match(/exit\[(.+)\]:(.+)/);
          if (!bt) return;
          $(`[data-navigate="${bt[1]}"]`).addClass('active');
          $(`.btn.exit.${bt[1]} span`).text(bt[2]);
        });
        return;
      },
      score(data) {
        $('#MudScore').html(data.html);
        const service = $('#MudScore .service .value').text();
        setTimeout(() => {
          $('body').attr('class', '');
          $('body').addClass(service);
        }, 200);
        return;
      },
      north(data) {
        return self.navigate(data);
      },
      northeast(data) {
        return self.navigate(data);
      },
      south(data) {
        return self.navigate(data);
      },
      southeast(data) {
        return self.navigate(data);
      },
      east(data) {
        return self.navigate(data);
      },
      northwest(data) {
        return self.navigate(data);
      },
      west(data) {
        return self.navigate(data);
      },
      southwest(data) {
        return self.navigate(data);
      },
      up(data) {
        return self.navigate(data);
      },
      down(data) {
        return self.navigate(data);
      },
      time(data) {
        const parts = data.text.split(' | ');
        if (!parts[1]) return;
        const T = parts[0].split(':');
        const D = parts[1].split(':')[1].trim();
        const DoW = D.split('-')

        const hour = T[1] < 10 ? `0${T[1]}` : T[1];
        const minute = T[2] < 10 ? `0${T[2]}` : T[2];

        $('#WatchHour').html(`<span>${hour}:${minute}</span>`);
        $('#WatchDay').html(`<span>${DoW[0].trim()}</span>`);
        $('#WatchDate').html(`<span>${DoW[1].trim()}</span>`);
        return;
      },
      stat(opts) {
        return self._logBROWSER(opts);
      },
      play(opts) {
        return this._logSHELL({
          type: opts.meta.key,
          format: opts.meta.format,
          text: 'FOLLOW UP COMPLETE',
          agent: this.client,
        });
      },

      say(opts) {
        const split_for_emoji = opts.text.split(':');
        const the_emoji = split_for_emoji.shift().toLowerCase().trim();
        const _emoji = emojis[the_emoji];
        if (_emoji) opts.text = `${_emoji} ${split_for_emoji.join(':')}`;
        $('#MudAlerts').prepend(`<div class="item alert">${opts.html || opts.text}</div>`);
      },

      eq(opts) {
        $('#MudEquipment').html('')
      },
      in(opts) {
        $('#MudInventory').html('')
      },
    };
    // check for auth variable to play mudder
    if (this.state === 'auth') return mudder.play(opts.a);

    // check the text for coordinate string to move map
    this.coordinates(opts.a.text, opts.a.meta.adventure.key);

    const strKey = opts.a.text.split(':')[0].replace(/\n/, '');
    const strChk = mudder[strKey] && typeof mudder[strKey] === 'function';

    if (strChk) {
      opts.a.meta.method = strChk;
      return mudder[strKey](opts.a);
    }

    const logger = mudder[method] && typeof mudder[method] === 'function';
    // if the method is a function then return that.
    if (logger) return mudder[method](opts.a);

    // default return for data not caught by logger check.
    return this._logSHELL({
      type: opts.a.meta.key,
      format: opts.a.meta.method,
      agent: opts.a.agent,
      text: opts.a.html || opts.a.text,
      data: opts.a,
    });
  }

  adventure(opts) {
    this._logBROWSER(opts.a);
  }

  processor(data) {

    console.log('processor', data);

    if (!data.a.text) return;
    const metaKey = data.a.meta.key;
    // here in the processor we want to check for any strings that also match from the first index.
    const metaChk = this[metaKey] && typeof this[metaKey] === 'function';
    const helpChk = data.a.meta.method === 'help';

    if (helpChk) return this._logBROWSER(data.a);

    else if (metaChk) return this[data.a.meta.key](data);
    // editor
    else return this._logSHELL({
      type: data.a.meta.key,
      format: data.a.meta.method,
      agent:data.a.agent,
      meta: data.a.meta,
      text: data.a.html ? data.a.html : data.a.text,
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

  Clear(q) {
    const clearing = [
      '#mud n',
      '#mud north',
      '#mud northeast',
      '#mud ne',
      '#mud northwest',
      '#mud nw',
      '#mud s',
      '#mud south',
      '#mud southeast',
      '#mud se',
      '#mud southwest',
      '#mud sw',
      '#mud e',
      '#mud east',
      '#mud w',
      '#mud west',
      '#mud u',
      '#mud up',
      '#mud d',
      '#mud down',
      '#mud look',
    ];
    if (!clearing.find(c => c === q)) return Promise.resolve();

    $('#MudAlerts').html('');
    $('#MudConsole').html(``);
    $('#MudSystem .systembox').html(``);
    $('#MudInventory').html(``);
    $('#MudEquipment').html(``);
    $('#MudObjects').html(``);
    $('#ShellOutput').html(``);


    $('.dots').removeClass('active');
    $('.btn.exit').removeClass('active');
    $('.btn.exit span').html('');
    $('[data-navigate]').removeClass('active');

    return Promise.resolve();
  }

  Init(socket) {
    return new Promise((resolve, reject) => {
      this.socket = socket;

      $('body').on('click', '.child > .key', e => {
        $(e.target).toggleClass('open');

      }).on('click', '[data-function]', e => {
        e.stopPropagation();
        e.preventDefault();
        const func = $(e.target).closest('[data-function]').data('function')
        this[func]();

      }).on('click', '[data-doc]', e => {
        e.stopPropagation()
        e.preventDefault();
        const doc = $(e.target).closest('[data-doc]').data('doc')
        this.Command(`#docs view ${doc}`, true);

      }).on('click', '[data-view]', e => {
        e.stopPropagation();
        e.preventDefault();
        const view = $(e.target).closest('[data-view]').data('view')
        this.View(view);

      }).on('click', '[data-cmd]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-cmd]').data('cmd');
        this.Command(cmd, true);

      // insert tty string into q intpu
      }).on('click', '[data-tty]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-tty]').data('tty');
        $('#q').val(cmd);
        document.getElementById('q').focus();

      // popup modal
      }).on('click', '[data-pop]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-pop]').data('pop');
        this.Command(cmd, true);

      }).on('click', '[data-mud]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-mud]').data('mud')
        this.Command(`#mud ${cmd}`, false);

      }).on('click', '[data-bmud]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-bmud]').data('bmud')
        this.Command(`#mud > ${cmd}`, false);

      }).on('click', '[data-button]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-button]').data('button')
        this.Command(cmd, true);

      }).on('click', '[data-data]', e => {
        e.stopPropagation()
        e.preventDefault();
        const data = $(e.target).data('data');
        this.Data(data);

      }).on('click', '[data-menu]', e => {
        e.stopPropagation()
        e.preventDefault();
        const menu = $(e.target).closest('[data-menu]').data('menu')
        this.Command(`#mud > ${menu}`, false);

      }).on('click', '[data-navigate]', e => {
        e.stopPropagation()
        e.preventDefault();
        const nav = $(e.target).closest('[data-navigate]').data('navigate');
        this.Command(`#mud ${nav}`, false);

      }).on('click', '[data-select]', e => {
        e.stopPropagation()
        e.preventDefault();
        this.Command(`#mud > ${e.target.dataset.select}`, false);

      // this is the on click function for when clicking a tag to search twitter.
      }).on('click', '.tag', e=> {
        e.stopPropagation()
        e.preventDefault();
        const text = $(e.target).text();
        this.Command(`#twitter search ${text}`, true);
      });

      $('#Shell').on('submit', e => {
        e.stopPropagation()
        e.preventDefault();
        const question = $('#q').val();
        this.Question(question).catch(console.error);
        $('#q').val('');
      });

      // setup client then trap the system events
      this.Client().then(() => {
        socket.emit('client:data', this.client);
        socket.on('stream:data', packet => {
          console.log('GLOBAL SOCKET', packet);
          const {data,includes} = packet.data;
          const username = packet.data.includes.users[0].username
          const text = [
            `<a href="https://twitter.com/${username}" target="_blank">@${username}</a>`,
            `<a href="https://twitter.com/${username}/status/${data.id}" target="_blank">#${packet.rule.tag}</a>`,
            data.text,
          ].join(' &gt; ');
          $('#MudAlerts').prepend(`<div class="item stream">${text}</div>`);
data.data
        })
        .on('socket:terminal', data => {
          // log the data packet to the ui
          console.log('SOCKET TERMINAL DATA', data);
          if (data.a.data) this._logData({
            [data.id]: {
              agent:data.a.agent,
              client:data.a.client,
              meta:data.a.meta,
              data:data.a.data,
            }
          });
          return this.processor(data);
        })
        .on('mud:pattern', data => {
          return this.patterns(data);
        })
        .on('mud:exits', data => {
          return this.exits(data);
        })
        .on('mud:time', data => {
          return this.time(data);
        });

        return resolve();

      }).catch(reject);
    });
  }
}

const socket = io('http://localhost:9303');
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
