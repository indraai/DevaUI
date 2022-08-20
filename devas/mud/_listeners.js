// Copyright (c)2022 Quinn Michaels. All rights reserved.
module.exports = {
  'mud:relay'(packet) {
    const {patterns, terminal} = this.func;
    if (!packet || !this.active) return;
    packet.a.meta.adventure = this.vars.adventure ? this.vars.adventure.key : false;
    packet.a.meta.key = this.agent.key;
    packet.a.agent = this.agent;

    if (packet.a.text == '>') return;
    if (packet.a.text == '\n\r') return;
    if (packet.a.text == '\n\n\r') return;
    if (packet.a.text.length == 0) return;

    this.func.triggers(packet.a.text);
    
    // parse alerts
    patterns(packet).then(aPacket => {
      return terminal(aPacket);
    }).catch(err => {
      console.error(err);
    })
  }
};
