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
  news: '<i class="icn icn-news" data-cmd="#cloud news" title="Read News"></i>',
  motd: '<i class="icn icn-voicemail" data-cmd="#coud motd" title="Read Motd"></i>',
  'The clouds disappear.': '<i class="icn icn-cloud-sun" title="The clouds disappear."></i>️️',
  'The sky is cloudy.': '️<i class="icn icn-cloud" title="The sky is cloudy."></i>',
  'It starts to rain.': '<i class="icn icn-cloud-rain" title="It starts to rain."></i>',
  'The rain stops.': '️<i class="icn icn-umbrella" title="The rain stops."></i>',
  'The sky is cloudy and you feel a cool breeze.': '️<i class="icn icn-cloud-windy" title="The sky is cloudy and you feel a breeze."></i>',
  'The sky is rainy and you feel a cool breeze.': '️<i class="icn icn-umbrella2" title="The sky is rainy and you feel a breeze."></i>',
  'Lightning starts in the sky.': '️<i class="icn icn-cloud-lightning" title="Lightning starts in the sky."></i>',
  'The lightning stops.': '️<i class="icn icn-cloud-crossed" title="The lightning stops."></i>',
  'The night begins.': '️<i class="icn icn-moon" title="The night begins."></i>',
  'This inside weather is amazing!': '️<i class="icn icn-home2" title="This inside weather is amazing!"></i>',
  'You go to sleep.': '️<i class="icn icn-bed" title="You go to sleep."></i>',
  'You are already sound asleep.': '️<i class="icn icn-bed" title="You are already sound asleep."></i>',
  'You awaken, and sit up.': '️<i class="icn icn-chair" title="You awaken, and sit up."></i>',
  'You sit down.': '️<i class="icn icn-chair" title="You sit down."></i>',
  'You\'re sitting already.': '️<i class="icn icn-chair" title="You\'re sitting already."></i>',
  'You stand up.': '️<i class="icn icn-hand-waving" title="You stand up."></i>',
};

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
    this.history_count = 50;
  }

  set content(txt) {
    this._content = txt;
  }
  get content() {
    return this._content;
  }

  _logConsole(data) {
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

  _logShell(opts) {
    if (!opts.text) return;

    if (this._shell.length > this.history_count) {
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

  _logViewer(opts) {
    const styled = this.content.match(/style=".+;"/);
    if (styled && styled[0]) opts.html = opts.html.replace(styled[0]);
    // this is where we move out the previous item in the .browser-item
    ['north','south','easat','west','northwest','southwest','northeast','southeast'].forEach(cl => {
      $('#Content .browser-item').removeClass(cl);
    });
    $('#Content .browser-item').removeClass('move-in').addClass('move-out').addClass(opts.meta.method);
    // now that the old item is moved off screen let's move a new item into view.
    setTimeout(() => {
      this.content = `<div ${styled && styled[0] ? styled[0] : ''} class="browser-item move-in ${opts.meta.method} ${opts.agent.key}">${opts.html}</div>`;
      this.Show();
    }, 1000);
    return Promise.resolve();
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
    const so = document.getElementById('Content');
    so.scrollTop = 0;
    return Promise.resolve(true);
  }

  docs(data) {
    console.log('DOCS DATA', data);
    if (data.meta.method === 'view') return this._logViewer(data);
    this._logShell({
      type: data.meta.key,
      method: data.meta.method,
      agent: data.agent,
      maeta: data.meta,
      text: data.html ? data.html : data.text,
    });

  }

  feature(data) {
    console.log('FEATURE CHECK', data);
    this._logViewer(data);
  }

  services(data) {}

  cloudEvent(data) {
    const self = this;
    // console.log('CLOUD EVENT', data);
    const actions = {
      room(data) {
        $('#WatchRoom').html(`room: ${data.value}`);
        return;
      },
      bars(opts) {
        const {id, bclass, value} = opts;
        const valmax = value.split('|');
        let bar = Math.floor((valmax[0] / valmax[1]) * 100);
        if (bar > 100) bar = 100

        if (bar < 30) bclass += ' warning';
        if (bar < 15) bclass += ' alert';
        $(`#${id} .bar`).removeClass('warning').removeClass('alert').addClass(bclass).attr('style', `--bar-width: ${bar}%;`);
      },
      alerts(data) {
        return self._logConsole({
          id: data.id,
          agent: data.agent,
          key: 'alerts',
          value: data.key,
          text: data.value,
          created: data.created,
          hash: data.hash,
        });
      },
      time(data) {
        const time = data.value.split(':');
        const hour = time[0] < 10 ? `0${time[0].trim()}` : time[0].trim();
        const minute = time[1] < 10 ? `0${time[1]}` : time[1];
        $('#WatchTime').html(`${hour}:${minute}`);
      },
      date(data) {
        const nDate = data.value.split('-');
        $('#WatchDay').html(nDate[0].trim());
        $('#WatchDate').html(nDate[1].trim());
      },

      weather(data) {
        const text = emojis[data.value] ? emojis[data.value] : data.value;
        $('#WatchWeather').html(text);
      },

      comm(data) {
        // console.log('COMM DATA', data);
        const value = data.value.toLowerCase().trim();
        const text = emojis[value] ? emojis[value] : value;
        $(`#WatchComm .${value}`).html(emojis[value]);
      },

      hit(data) {
        this.bars({
          id: 'StatsHit',
          bclass: 'hit',
          value: data.value,
        });
      },

      mana(data) {
        this.bars({
          id: 'StatsMana',
          bclass: 'mana',
          value: data.value,
        });
      },

      move(data) {
        this.bars({
          id: 'StatsMove',
          bclass: 'mana',
          value: data.value,
        });
      },
      hunger(data) {
        this.bars({
          id: 'StatsHunger',
          class: 'hunger',
          value: data.value,
        });
      },

      thirst(data) {
        this.bars({
          id: 'StatsThirst',
          class: 'thirst',
          value: data.value,
        });
      },
      save(data) {
        $('.log-item.cloud .text button').addClass('disabled');
        return this.alerts(data);
      },
      current(data) {
        $('#q').val(`#cloud > ${data.value}`);
        document.getElementById('q').focus();
      },
      drink(data) {
        return this.alerts(data);
      },
      info(data) {
        return this.alerts(data);
      },
      alert(data) {
        return this.alerts(data);
      },
      pos(data) {
        // console.log('COMM DATA', data);
        console.log('POS VALUE', data.value);
        const text = emojis[data.value] ? emojis[data.value] : data.value;
        $(`#WatchPos`).html(text);
      },
      equipment(data) {
        const item = data.value.split(':');
        $('#Equipment').append(`<div class="item ${item[0].trim().toLowerCase()}">${emojis[item[0].trim().toLowerCase()]} ${item[1].trim()}</div>`);
      },

      inventory(data) {
        $('#Inventory').append(`<div class="item">${data.value}</div>`);
      },
    }
    if (actions[data.key]) {
      return actions[data.key](data);
    }
    const thehtml = [
      `<span class="label">${data.key}</span>`,
      `<span class="value">${data.value}</span>`,
    ];
    console.log('CLOUD DATA EVENT', data);
    $(`#${data.key}`).html(thehtml.join(''));
  }

  // parses coordinates from a string
  coordinates(txt, space) {
    const coord = /coordinates:(.+)\[(.+)\|(.+)\]/g;
    const coordinates = coord.exec(txt);
    if (!coordinates) return;
    const nameS = coordinates[1].split('-');
    const name = nameS && nameS[1] ? nameS[1] : 'main';
    const _map = `/asset/${space}/map/${nameS[0]}/${name}`;
    if (_map !== this.map) {
      this.map = _map;
      $('.controls').css({'background-image': `url(${this.map})`});
    }
    $('.controls').css({'background-position': `${coordinates[2]}px ${coordinates[3]}px`});
    return;
  }

  cloud(data) {
    console.log('CLOUD', data);

    const processor = {
      exits(text) {
        $(`#Map .dots`).removeClass('active');
        $(`#Exits .btn`).removeClass('active');
        const exits = text.split('\n');
        exits.forEach(ex => {
          const bt = ex.match(/exit\[(.+)\]:(.+)/);
          console.log('match', bt);
          if (!bt) return;
          $(`#Map .grid .${bt[1]}-dot`).addClass('active');
          $(`#Exits .btn.exit.${bt[1]}`).addClass('active');
          $(`#Exits .btn.exit.${bt[1]} span`).text(bt[2]);
        });
        return;
      },
    }
    // check the text for coordinate string to move map
    this.coordinates(data.text, data.meta.space);

    switch (data.meta.method) {
      case 'look':
      case 'goto':
      case 'north':
      case 'south':
      case 'east':
      case 'west':
      case 'northwest':
      case 'southwest':
      case 'southeast':
      case 'northeast':
      case 'up':
      case 'down':
        this._logViewer(data).then(() => {
          this.Question('#cloud exits', false);
        });
        break;
      case 'exits':
        return processor.exits(data.text);
      default:
        return this._logShell({
          type: data.meta.key,
          format: data.meta.method,
          agent:data.agent,
          meta: data.meta,
          text: data.html ? data.html : data.text,
        });

    }
  }
  processor(data) {
    if (!data.text) return;
    const { meta } = data;
    const metaKey = meta.key;
    // here in the processor we want to check for any strings that also match from the first index.
    const metaChk = this[metaKey] && typeof this[metaKey] === 'function';
    const helpChk = meta.method === 'help';
    const featureChk = ['security','support','services'].includes(meta.method);

    if (helpChk) return this._logViewer(data);
    else if (featureChk) return this.feature(data);
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
      }).on('click', '[data-tty]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-tty]').data('tty');
        $('#q').val(cmd);
        document.getElementById('q').focus();
      }).on('click', '[data-button]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-button]').data('button')
        this.Question(cmd, false);
      }).on('click', '[data-cloudbtn]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-cloudbtn]').data('cloudbtn')
        this.Question(`#cloud > ${cmd}`, false);
      }).on('click', '[data-cloudcmd]', e => {
        e.stopPropagation()
        e.preventDefault();
        const cmd = $(e.target).closest('[data-cloudcmd]').data('cloudcmd')
        this.Question(`#cloud ${cmd}`, false);
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
      socket.on('socket:global', data => {
        return this.processor(data.a);
      });
      socket.on('cloud:event', data => {
        return this.cloudEvent(data);
      });
      socket.on('socket:devacore', data => {
        // if (data.key === 'prompt')  return this._logShell({
        //   type: data.value,
        //   format: data.key,
        //   agent:data.agent,
        //   meta: false,
        //   text: data.text,
        // });
        this._logConsole(data)
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
