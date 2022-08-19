// Copyright (c)2022 Quinn Michaels. All Rights Reserved.
const utils = {
  logHTML(opts) {
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
    utils.logDATA(data)

    return setTimeout(() => {
      const so = document.getElementById('ShellOutput');
      if (so) so.scrollTop = so.scrollHeight;
    },250);
  },
  scrollTop(elem) {
    setTimeout(() => {
      const so = document.getElementById(elem);
      so.scrollTop = 0;
    }, 100);
  },
  logBROWSER(opts) {
    const text = opts.text.replace(/\n\r/g, '<br/>').replace(/<div class="line">&gt;<\/div>/g, '');
    const styled = opts.html.match(/style=".+;"/);
    if (styled && styled[0]) opts.html = opts.html.replace(styled[0])
    let theHtml = `<div ${styled && styled[0] ? styled[0] : ''} class="browser-item move-in ${opts.meta.method} ${opts.agent.key}">${opts.html}</div>`;
    $('#Content .browser-item').removeClass('north south east west up down northwest northeast southwest southeast move-in').addClass(`move-out ${opts.meta.method}`);
    setTimeout(() => {
      $('#Content').html(theHtml);
      utils.scrollTop('Content');
    }, 950)
    return true;
  },
  logDATA(data) {
    let theHtml;
    if (!data) return;

    switch (data.meta.key) {
      case 'artist':
        theHtml = [
          '<h1>Artist Card</h1>',
          `<div class="artist-card"><img src="data:image/png;base64,${data.image}" alt="" /></div>`
        ]
        $('#Content').html(`<div class="browser-item artist card">${theHtml.join('')}</div>`)
        return;
      default:
    }
  },
}
export default utils;
