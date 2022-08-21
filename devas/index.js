// Copyright (c)2022 Quinn Michaels
//  Main Devas include file wheere all the necessary Devas are included.
const DEVA = {
  error: require('@indra.ai/errordeva'),
  feecting: require('@indra.ai/feectingdeva'),
  socket: require('@indra.ai/socketdeva'),
  docs: require('@indra.ai/docsdeva'),
  telnet: require('@indra.ai/telnetdeva'),
  mud: require('@indra.ai/muddeva'),
  adv: require('./adv'),
  web: require('./web'),
  chuck: require('./chuck'),
};
module.exports = DEVA;
