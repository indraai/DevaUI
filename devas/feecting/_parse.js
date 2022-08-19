"use strict"
const fs = require('fs');
const path = require('path');
const basePath = path.join(__dirname, '..', '..');
const {formatDate} = require('../../src/lib');

class Parser {
  constructor(opts) {
    this.id = opts.id;
    this.key = opts.key;
    this.cmd = opts.cmd;
    this.params = opts.params;
    this.vars = opts.vars || {};
    this.talk = opts.talk || [];
    this.text = opts.text || false;
    this.html = false;
    this.client = opts.client || false;
    this.agent = opts.agent || false;
    this.container = opts.container || false;
  }

  uid() {
    return Math.floor(Math.random() * Date.now());
  }

  /***********
    func: formatHTML
    params: text - text string to format
    describe: the main formatting function where feecting text is converted into HTML.
  ***********/

  formatHTML() {
    this.text = '\n' + this.text.replace(/\@\@/g, '@');
    this.html = this.text
      // main label formatting

      .replace(/\n::BEGIN:(.+)/g, '<div class="CONTAINER $1">')
      .replace(/\n::END:(.+)/g, '</div>')

      .replace(/\n?\s+?\/\/(.+)/g, '<div class="comment">$1</div>')

      .replace(/(\n)(var):(.+)\r?/g, `$1<div class="item $2"><span class="label">$2</span><span class="value">$3</span></div>`)
      .replace(/(\n)(var)\[(.+)\]:(.+)\r?/g, `$1<div class="item $2"><span class="label">$3</span><span class="value">$4</span></div>`)

      .replace(/::begin:(.+)/g, '<div class="box $1">')
      .replace(/::end:(.+)/g, '</div>')

      .replace(/\n####\s(.+)/g, `<h4>$1</h4>`)
      .replace(/\n###\s(.+)/g, `<h3>$1</h3>`)
      .replace(/\n##\s(.+)/g, `<h2>$1</h2>`)
      .replace(/\n#\s(.+)/g, `<h1>$1</h1>`)

      .replace(/(\n)={4,}\n/g, `$1<hr class="double xsmall" />`)
      .replace(/(\n)={3}\n/g, `$1<hr class="double small" />`)
      .replace(/(\n)={2}\n/g, `$1<hr class="double medium" />`)
      .replace(/(\n)={1}\n/g, `$1<hr class="double large" />`)
      .replace(/(\n)-{4,}\n/g, `$1<hr class="single xsmall"/>`)
      .replace(/(\n)-{3}\n/g, `$1<hr class="single small"/>`)
      .replace(/(\n)-{2}\n/g, `$1<hr class="single medium"/>`)
      .replace(/(\n)-{1}\n/g, `$1<hr class="single large"/>`)

      .replace(/(\s)(\#.+?)(\b)/g, `$1<span class="tag hash">$2</span>$3`)
      .replace(/(\s)(\@.+?)(\b)/g, `$1<span class="tag mention">$2</span>$3`)
      .replace(/(\s)(\$.+?)(\b)/g, `$1<span class="tag local">$2</span>$3`)
      .replace(/(\s)(\!.+?)(\b)/g, `$1<span class="tag bang">$2</span>$3`)

      .replace(/(\s)\_([#|@|$|!].+?)(\b)/gi, `$1$2$3`)

      // image processing regex
      .replace(/\nimage:\s?(.+)/g, `<div class="image"><img src="$1" /></div>`)
      .replace(/\n(avatar|thumbnail):\s?(.+)/g, `<div class="$1"><img src="$2" /></div>`)

      .replace(/\n?img:\s?(.+)\/(.+)\/(\d+)\/avatar/g, `<button class="btn avi" data-cmd="#adv $2:$1 $3/main:look"><img src="/asset/$1/$2/$3/avatar" /></button>`)
      .replace(/\n?img:\s?(.+)/g, `<div class="image"><img src="/asset/$1" /></div>`)

      .replace(/\n(select)\[(.+):(.+)\]:(.+)/gi, `<div class="item $1"><span class="label" data-index="$2">$3</span><span class="input"><button type="button" class="input-select" name="$1" data-select="$2">$4</button></span></div>`)
      .replace(/(\n?)(menu)\[(.+)\]:(.+)/g, '$1<button class="btn $2" title="$3" data-menu="$4">$3</button>')
      .replace(/(\n?)(confirm)\[(.+)\]:(.+)/g, '$1<button class="btn $2" title="$3" data-mud="$4">$3</button>')
      .replace(/(\n?)(bmud)\[(.+)\]:(.+)/g, '$1<button class="btn $2" title="$3" data-bmud="$4">$3</button>')
      .replace(/\n(mud)\[(.+)\]:(.+)/g, '<div class="mud-cmd"><button class="btn $1" title="$2" data-mud="$3">$2</button></div>')

      .replace(/(\n?)(button)\[(.+)\]:(.+)/g, '$1<button class="btn $2" title="$3" data-button="$4">$3</button>')

      // cmd/tty tag parser
      .replace(/(\n)(cmd|tty):(.+)\r?/g, `$1<div class="item $2"><span class="label">$2</span><span class="value"><button class="btn $2" alt="$3" data-$2="$3">$3</button></span></div>`)
      .replace(/(\n)(cmd|tty)\[(.+)\]:(.+)\r?/g, `$1<div class="item $2"><span class="label">$2</span><span class="value"><button class="btn $2" alt="$2 $4" data-$2="$4">$3</button></span></div>`)

      .replace(/(\n?)(telnet):(.+)\r?/g, `$1<div class="item $2"><span class="label">$2</span><span class="value"><button class="btn $2" alt="$3" data-cmd="#telnet open $3">$3</button></span></div>`)
      .replace(/(\n?)(telnet)\[(.+)\]:(.+)\r?/g, `$1<div class="item $2"><span class="label">$2</span><span class="value"><button class="btn $2" alt="$4" data-cmd="#telnet open:$3 $4">$4</button></span></div>`)

      .replace(/\n(\d+)\. (.+)/g, `<div class="number-item" data-label="$1">$2</div>`)
      .replace(/\n> (.+)\r?/g, `<div class="list-item">$1</div>`)
      .replace(/\n- (.+)\r?/g, `<div class="line-item">$1</div>`)

      // pdf links
      .replace(/(\n)(pdf):\s?(.+)/g, `$1<div class="$2"><iframe width="100%" height="100%" src="$3" frameborder="0"></iframe></div>`)

      // youtube links
      .replace(/\nyoutube:\s?(.+)/g, `\n<div class="center youtube-video-player"><iframe src="https://www.youtube.com/embed/$1" frameborder="0"></iframe></div>`)

      // youtube links
      .replace(/\nmap:\s?(.+)/g, `\n<div class="center google-map-player"><iframe src="https://www.google.com/maps/embed?pb=$1" frameborder="0" width="650" height="400" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`)



      // youtube links with parameters
      .replace(/(\n)(youtube)\[play\]:\s?(.+)/g, `\n<div class="center youtube-video-player"><iframe src="https://www.youtube.com/embed/$3?&autoplay=1" frameborder="0"></iframe></div>`)

      // cspan links
      .replace(/\ncspan:\s?(.+)/g, `\n<div class="center cspan"><iframe width=512 height=330 src='https://www.c-span.org/video/standalone/?$1' allowfullscreen='allowfullscreen' frameborder=0></iframe></div>`)

      // archive embed
      .replace(/\narchive:(.+)/g, `<div class="center archive"><iframe src="https://archive.org/embed/$1" width="560" height="384" frameborder="0" allowfullscreen></iframe></div>`)

      // links
      // link with just url
      .replace(/(\n?)(link):\s?(.+)/g, `$1<div class="item $2"><span class="label">link</span><span class="value"><a href="$3" class="$2" alt="$2" target="_blank">$3</a></span></div>`)

      // link with bracket label/text
      .replace(/(\n?)(link)\[(.+)\]:\s?(.+)/g, `$1<div class="item $2"><span class="label">link</span><span class="value"><a href="$4" class="$2" alt="$3" target="$2">$3</a></span></div>`)

      // numbered list item of href links
      .replace(/(\n?)(href)\[(\d+):(.+)\]:\s?(.+)(\r?)/g, `\n<div class="number-item" data-label="$3"><a href="$5" class="$2" alt="$4">$4</a></div>\r`)
      // standard href
      .replace(/(\n?)(href)\[(.+)\]:\s?(.+)(\r?)/g, `\n<a href="$4" class="$2" alt="$3">$3</a>\r`)


      .replace(/(\n)(audio)\[(.+)\]:\s?(.+)/g, `$1<div class="item $2"><span class="label">$2</span><span class="value"><audio class="$3" src="$4" controls autoplay></audio></span></div>`)

      // audio feature
      .replace(/(\n)(audio):\s?(.+)/g, `$1<div class="item $2"><span class="label">$1</span><span class="value"><audio class="$2-player" src="$3" controls></audio></span></div>`)

      // wiki feature
      .replace(/(\n)(wiki)\[(.+)\]:\s?(.+)/g, `$1<button class="btn $2" title="$4" data-button="#$2 summary $4"><i class="icn icn-document"></i>$3</button>`)

      // look feature
      .replace(/(\n)(look)\[(.+)\]:\s?(.+)/g, `$1<button class="btn $2" title="$4" data-bmud="$2 $4"><i class="icn icn-binoculars2"></i>$3</button>`)
      // inline look button
      .replace(/(\b)(look|read)\[(.+)\]/g, `$1<button class="btn $2-inline" title="$3" data-bmud="$2 $3">$3</button>`)

      .replace(/\[PRESS RETURN\]/g, '<div class="press_return"><button class="btn return" title="Press Return" data-bmud="">Press Return</button><div>')

      // note info formatting
      .replace(/(\n?)(note|info|thanks|warning|alert|greeting|extra):\s?(.*)/gi, `$1<div class="$2">$3</div>`)

      // doc[*title*]:*link*
      .replace(/\n?(docs)\[(.+)\]:(.+)/g, '<button class="btn $1" title="$2" data-doc="$3">$2</button>')

      // cmd/tty tag parser


      .replace(/\n(a):\s?(.+)/gi, `<div class="article">$2</div>`)
      .replace(/\n(l):\s?(.+)/gi, `<div class="line">$2</div>`)
      .replace(/\n(p|h1|h2|h3|h4|h5|article,div,span)\[speak\]:\s?(.+)/gi, `<$1><button class="btn speak" alt="Speak" data-cmd="#slab tts $2">💬</button> $2</$1>`)
      .replace(/\n(p|h1|h2|h3|h4|h5|article)\[speak\:(.+)?]:\s?(.+)/gi, `<$1><button class="btn speak" alt="Speak" data-cmd="#slab tts:$2 $3">💬</button> $3</$1>`)
      .replace(/\n(p|div|span|h1|h2|h3|h4|h5|article|section):\s?(.+)/gi, `<$1>$2</$1>`)
      .replace(/\n(\w+):\s?(.+)/gi, `<div class="item $1"><span class="label">$1</span><span class="value">$2</span></div>`)
      .trim();

      // set the container
      // if (this.container) this.html = `<div class="${this.container}">${this.html}</div>`;

      // .replace(/(.+)\n\n/g, '<p>$1</p>')
      // .replace(/(.+)\n/g, '<div class="line">$1</div>')
      // .replace(/\n/g, '<div class="line br"></div>')

      // .replace(/\n\r?/g, '<div class="line"></div>');
      // .replace(/(.*)/g, '<div class="line">$1</div>');
    // Reference to https://github.com/sindresorhus/ansi-regex
    let cssStyle = []
    if (this.vars.bgcolor) cssStyle.push(`--browser-item-bgcolor:${this.vars.bgcolor.value}`);
    if (this.vars.bg) cssStyle.push(`--browser-item-image: url(/asset/${this.vars.bg.value})`);
    if (this.vars.color) cssStyle.push(`--browser-item-color: ${this.vars.color.value}`);
    if (this.vars.size) cssStyle.push(`--browser-item-size: ${this.vars.size.value}`);

    if (cssStyle.length) {
      this.html = `<section class="cover" style="${cssStyle.join(';')}">${this.html}</section>`;
    }
    else {
      this.html = `${this.html}`
    }
    return this.html;
  }

  /***********
    func: _extractVars
    describe: Recursive function to extract variables from a text string.
    params: text - text string to extract variables from.
  ***********/
  _extractVars() {
    if (!this.text) return false;
    const id = this.uid();
    const reggie = this.text.match(/\n?(\#|\@|\$)(.+)\s?=\s?(.+)/);
    if (!reggie) return;

    this.vars[reggie[2].trim()] = {
      id,
      str: reggie[0],
      type: reggie[1].trim(),
      name: reggie[2].trim(),
      value: reggie[3].trim(),
    }
    this.text = this.text.replace(reggie[0], `\nvar[${reggie[1].trim()}${reggie[2].trim()}]:${reggie[3].trim()}\r`);
    return this._extractVars();
  }

  /***********
    func: getVars
    params: text - initial text string to get variables from.
    describe: this is a helper function to recursive _extractVars.
  ***********/
  getVars() {
    if (!this.text) return false;
    this.text = this.text.replace(/:id:/g, this.id)
                          .replace(/:date:/g, formatDate(Date.now(), 'long', true))
                          .replace(/:client_id:/g, this.client.id)
                          .replace(/:client_name:/g, this.client.name);
    return this._extractVars();
  }

  /***********
    func: extractTalk
    params: text - text string to extract talk triggers from.
    describe: extract talk functions from a text string to communication with other agents/deva.
  ***********/
  _extractTalk() {
    if (!this.text) return false;
    const id = this.uid();
    const reggie = (/(^|\n)talk:\s?(.+)/i).exec(this.text);
    if (!reggie) return;
    const placeholder = `::${id}::`;
    this.talk.push({
      id,
      placeholder,
      value: reggie[2],
    });
    this.text = this.text.replace(reggie[0], '\n' + placeholder + '\n')
    return this._extractTalk();
  }

  /***********
    func: getTalk
    params: text - text string to parse the talk triggers from.
    describe: Helper function to initiate recursive _extractTalk.
  ***********/
  getTalk() {
    if (!this.text) return false;
    return this._extractTalk();
  }
}

module.exports = (opts) => {
  const {meta, text, client, agent} = opts.q;
  const key = agent ? agent.key : client.key;
  const parser = new Parser({
    id: opts.id,
    key,
    cmd: meta.params.shift(),
    container: meta.params.length ? meta.params.join(' ') : false,
    params: meta.params,
    text,
    client,
    agent,
  });
  parser.getVars();
  parser.getTalk();
  return {
    text: parser.text.replace(/\\(#|@|$)/g, `$1`),
    html: parser.formatHTML(),
    data: {
      id: parser.id,
      params: parser.params,
      vars: parser.vars,
      talk: parser.talk,
    },
  }
}
