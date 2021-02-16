'use strict'

const { Client } = require('discord-rpc');

const clientId = '811111315988283413';

const day = 24 * 60 * 60;
const landingTimestamp =  1613681692;

const rpcClient = new Client({ transport: 'ipc' });

rpcClient.on('ready', () => {
  update();
  setInterval(update, 10 * 1000);
});

function update() {
  const currentTimestamp = Math.round(Date.now() / 1000);
  const diff = landingTimestamp - currentTimestamp;
  const diffDays = Math.floor(diff / day);
  let state = undefined;
  let details = diff > 0 ? "#CountdownToMars" : 'Perseverance is on Mars!';
  if (diffDays > 0) {
    state = `${diffDays} Day${diffDays === 1 ? '' : 's'}`;
  }
  const watchable = diff < 4 * 60 * 60;
  const buttons = [
    {
      label: watchable ? 'Watch the Landing!' : 'How Landing Works!',
      url: watchable ? 'https://youtu.be/gm0b_ijaYMQ' : 'https://mars.nasa.gov/mars2020/timeline/landing/entry-descent-landing/',
    },
    {
      label: 'Read about Perseverance!',
      url: 'https://mars.nasa.gov/mars2020/',
    },
  ];

  rpcClient.setActivity({
    state,
    details,
    endTimestamp: diff > 0 ? landingTimestamp : undefined,
    largeImageKey: 'nasa',
    largeImageText: 'Nasa is running this mission!',
    buttons,
  }).catch(console.error);
}

rpcClient.login({ clientId });
