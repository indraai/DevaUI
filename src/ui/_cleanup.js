// PATTERNS FOR MUD REALM
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

// MUD CLEARING CODE
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

// MUD SOCKET EVENTS
.on('mud:pattern', data => {
  return this.patterns(data);
})
.on('mud:exits', data => {
  return this.exits(data);
})
.on('mud:time', data => {
  return this.time(data);
});

// MUD REALM FUNCTIONS
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


// more old code removed to streamline interface.
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

// SOCKET EVENTS
.on('stream:data', packet => {
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

// click events
.on('click', '[data-function]', e => {
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

// old command function
Command(text, log=true) {
  const q = document.getElementById('q');
  if (!q) return Promise.resolve();
  q.focus();
  return this.Question(text, log).catch(console.error);
}
