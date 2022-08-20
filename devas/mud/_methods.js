// Copyright (c)2022 Quinn Michaels. All Rights Reserved.
module.exports = {
  'play'(packet) {
    return this.func.play(packet);
  },
  '>'(packet) {
    return this.func.write(false, packet.q.text);
  },
  '!'(packet) {
    return this.func.write('!', packet.q.text);
  },
  ln(packet) {
    packet.q.text = '\\r';
    return this.methods.$(packet);
  },

  // save the user to the system.
  save(packet) {
    return this.func.write('save', packet.q.text);
  },

  // quit the system.
  quit(packet) {
    return this.func.write('quit', packet.q.text);
  },

  // return mud help menu
  mhelp(packet) {
    return this.func.write('help', packet.q.text)
  },

  // list system commands
  commands(packet) {
    return this.func.write('commands', packet.q.text);
  },

  // list where agent/object is located.
  where(packet) {
    return this.func.write('where', packet.q.text);
  },
  // get the current system time.
  time(packet) {
    return this.func.write('time', packet.q.text);
  },
  // show the system news.
  news(packet) {
    return this.func.write('news', packet.q.text);
  },
  motd(packet) {
    return this.func.write('motd', packet.q.text);
  },

  // calls for direction movements.
  north(packet) {
    return this.func.write('north');
  },
  n(packet) {
    return this.methods.north(packet);
  },
  south(packet) {
    return this.func.write('south');
  },
  s(packet) {
    return this.methods.south(packet);
  },
  east(packet) {
    return this.func.write('east');
  },
  e(packet) {
    return this.methods.east(packet);
  },
  west(packet) {
    return this.func.write('west');
  },
  w(packet) {
    return this.methods.west(packet);
  },
  southwest(packet) {
    return this.func.write('southwest');
  },
  sw(packet) {
    return this.methods.southwest(packet);
  },
  southeast(packet) {
    return this.func.write('southeast');
  },
  se(packet) {
    return this.methods.southeast(packet);
  },
  northeast(packet) {
    return this.func.write('northeast');
  },
  ne(packet) {
    return this.methods.northeast(packet);
  },
  northwest(packet) {
    return this.func.write('northwest');
  },
  nw(packet) {
    return this.methods.northwest(packet);
  },

  up(packet) {
    return this.func.write('up');
  },
  u(packet) {
    return this.methods.up(packet);
  },
  down(packet) {
    return this.func.write('down');
  },
  d(packet) {
    return this.methods.down(packet);
  },

  // yes/no methods
  yes(packet) {
    return this.func.write('yes', false);
  },
  no(packet) {
    return this.func.write('no', false);
  },

  follow(packet) {
    return this.func.write('follow', packet.q.text);
  },

  hit(packet) {
    return this.func.write('hit', packet.q.text);
  },
  kick(packet) {
    return this.func.write('kick', packet.q.text);
  },
  tackle(packet) {
    return this.methods.hit(packet);
  },
  fight(packet) {
    return this.methods.hit(packet);
  },

  info(packet) {
    return this.func.write('info', packet.q.text);
  },
  look(packet) {
    return this.func.write('look', packet.q.text);
  },
  scan(packet) {
    return this.func.write('scan', packet.q.text);
  },
  // list items
  list(packet) {
    return this.func.write('list', packet.q.text)
  },
  // look around
  exits(packet) {
    return this.func.write('exits', packet.q.text);
  },
  goto(packet) {
    return this.func.write('goto', packet.q.text);
  },
  offer(packet) {
    return this.func.write('offer', packet.q.text);
  },
  rent(packet) {
    return this.func.write('rent', packet.q.text);
  },
  buy(packet) {
    return this.func.write('buy', packet.q.text);
  },
  sell(packet) {
    return this.func.write('sell', packet.q.text);
  },
  value(packet) {
    return this.func.write('value', packet.q.text);
  },

  lock(packet) {
    return this.func.write('lock', packet.q.text);
  },
  unlock(packet) {
    return this.func.write('unlock', packet.q.text);
  },
  open(packet) {
    return this.func.write('open', packet.q.text);
  },
  close(packet) {
    return this.func.write('close', packet.q.text);
  },
  enter(packet) {
    return this.func.write('enter', packet.q.text);
  },
  leave(packet) {
    return this.func.write('leave', packet.q.text);
  },
  flee(packet) {
    return this.func.write('flee', packet.q.text);
  },
  con(packet) {
    return this.func.write('consider', packet.q.text);
  },

  get(packet) {
    return this.func.write('get', packet.q.text);
  },

  take(packet) {
    return this.func.write('take', packet.q.text);
  },

  drop(packet) {
    return this.func.write('drop', packet.q.text);
  },
  put(packet) {
    return this.func.write('put', packet.q.text);
  },
  give(packet) {
    return this.func.write('give', packet.q.text);
  },
  donate(packet) {
    return this.func.write('donate', packet.q.text);
  },
  wear(packet) {
    return this.func.write('wear', packet.q.text);
  },
  grab(packet) {
    return this.func.write('grab', packet.q.text);
  },
  examine(packet) {
    return this.func.write('examine', packet.q.text);
  },
  use(packet) {
    return this.func.write('use', packet.q.text);
  },
  hold(packet) {
    return this.func.write('hold', packet.q.text);
  },
  wield(packet) {
    return this.func.write('wield', packet.q.text);
  },
  fill(packet) {
    return this.func.write('fill', packet.q.text);
  },
  order(packet) {
    return this.func.write('order', packet.q.text);
  },
  cast(packet) {
    return this.func.write('cast', packet.q.text);
  },

  sit(packet) {
    return this.func.write('sit', packet.q.text);
  },
  stand(packet) {
    return this.func.write('stand', packet.q.text);
  },
  rest(packet) {
    return this.func.write('rest', packet.q.text);
  },
  sleep(packet) {
    return this.func.write('sleep', packet.q.text);
  },
  wake(packet) {
    return this.func.write('wake', packet.q.text);
  },
  pose(packet) {
    return this.func.write('pose', packet.q.text);
  },

  eat(packet) {
    return this.func.write('eat', packet.q.text);
  },
  taste(packet) {
    return this.func.write('taste', packet.q.text);
  },
  pour(packet) {
    return this.func.write('pour', packet.q.text);
  },
  drink(packet) {
    return this.func.write('drink', packet.q.text);
  },
  sip(packet) {
    return this.func.write('sip', packet.q.text);
  },


  // admin methods
  whelp(packet) {
    return this.func.write('wizhelp', packet.q.text);
  },
  wizlist(packet) {
    return this.func.write('wizlist', packet.q.text);
  },
  wiz(packet) {
    return this.func.write('wiz', packet.q.text);
  },
  goto(packet) {
    return this.func.write('goto', packet.q.text);
  },
  shutdown(packet) {
    return this.func.write('shutdown', packet.q.text);
  },
  stat(packet) {
    return this.func.write('stat', packet.q.text);
  },
  set(packet) {
    return this.func.write('set', packet.q.text);
  },


  score(packet) {
    return this.func.write('score', false);
  },
  // get inventory
  inventory(packet) {
    return this.func.write('inventory', packet.q.text);
  },
  in(packet) {
    return this.methods.inventory(packet);
  },
  // get equipment
  equipment(packet) {
    return this.func.write('equipment', packet.q.text);
  },
  eq(packet) {
    return this.methods.equipment(packet);
  },

  prefedit(packet) {
    return this.func.write('prefedit', packet.q.text);
  },



  say(packet) {
    return this.func.write('say', packet.q.text);
  },
  shout(packet) {
    return this.func.write('shout', packet.q.text);
  },
  tell(packet) {
    return this.func.write('tell', packet.q.text);
  },
  ask(packet) {
    return this.func.write('ask', packet.q.text);
  },
  whisper(packet) {
    return this.func.write('whisper', packet.q.text);
  },
  emote(packet) {
    return this.func.write('emote', packet.q.text);
  },

  echo(packet) {
    return this.func.write('echo', packet.q.text);
  },
  gecho(packet) {
    return this.func.write('gecho', packet.q.text);
  },
  qecho(packet) {
    return this.func.write('qecho', packet.q.text);
  },

  gossip(packet) {
    return this.func.write('gossip', packet.q.text);
  },
  auction(packet) {
    return this.func.write('auction', packet.q.text);
  },
  grats(packet) {
    return this.func.write('grats', packet.q.text);
  },


  // read an item
  read(packet) {
    return this.func.write('read', packet.q.text);
  },
  write(packet) {
    return this.func.write('write', packet.q.text);
  },
  remove(packet) {
    return this.func.write('remove', packet.q.text);
  },


  practice(packet) {
    return this.func.write('practice', packet.q.text);
  },


  gold(packet) {
    return this.func.write('gold', packet.q.text);
  },
  balance(packet) {
    return this.func.write('balance', packet.q.text);
  },
  withdraw(packet) {
    return this.func.write('withdraw', packet.q.text);
  },
  deposit(packet) {
    return this.func.write('deposit', packet.q.text);
  },

  who(packet) {
    return this.func.write('who', packet.q.text);
  },
  whois(packet) {
    return this.func.write('whois', packet.q.text);
  },
  map(packet) {
    return this.func.write('map', packet.q.text);
  },

  // wiz functions
  cedit(packet) {
    return this.func.write('cedit', packet.q.text);
  },
  redit(packet) {
    return this.func.write('redit', packet.q.text);
  },
  rlist(packet) {
    return this.func.write('rlist', packet.q.text);
  },
  oedit(packet) {
    return this.func.write('oedit', packet.q.text);
  },
  olist(packet) {
    return this.func.write('olist', packet.q.text);
  },
  medit(packet) {
    return this.func.write('medit', packet.q.text);
  },
  mlist(packet) {
    return this.func.write(false, `mlist ${packet.q.text}`);
  },
  zedit(packet) {
    return this.func.write('zedit', packet.q.text);
  },
  zlist(packet) {
    return this.func.write(false, `zlist ${packet.q.text}`);
  },
  zreset(packet) {
    return this.func.write(false, `zreset ${packet.q.text}`);
  },
  sedit(packet) {
    return this.func.write('sedit', packet.q.text);
  },
  slist(packet) {
    return this.func.write('slist', packet.q.text);
  },

  msgedit(packet) {
    return this.func.write('msgedit', packet.q.text);
  },

  trigedit(packet) {
    return this.func.write('trigedit', packet.q.text);
  },
  tlist(packet) {
    return this.func.write('tlist', packet.q.text);
  },

  qedit(packet) {
    return this.func.write('qedit', packet.q.text);
  },

  purge(packet) {
    return this.func.write('purge', packet.q.text)
  },

  dig(packet) {
    return this.func.write('dig', packet.q.text)
  },

  input(packet) {
    return this.func.data(packet, 'input')
  },

  descrip(packet) {
    return this.func.data(packet, 'descrip')
  },

  uid(packet) {
    return Promise.resolve(this.uid());
  },
  status(packet) {
    return this.status();
  },

  help(packet) {
    return new Promise((resolve, reject) => {
      this.lib.help(packet.q.text, __dirname).then(text => {
        return resolve({text})
      }).catch(reject);
    });
  }
}
