'use strict'

const { Client } = require('discord-rpc');
const julian = require('julian');

const clientId = '811145575134658561';
const day = 24 * 60 * 60;
const landingTimestamp = 1613681692;

function getMSD(earthTimestamp) {
  return (julian(earthTimestamp) - 2405522.0028779) / 1.0274912517;
}
function getMissionSol() {
  const date = Date.now();
  return Math.floor(getMSD(date) - getMSD(new Date(landingTimestamp * 1000).getTime()));
}

const rpcClient = new Client({ transport: 'ipc' });

rpcClient.on('ready', () => {
    update();
    setInterval(update, 10 * 1000);
});

rpcClient.on('disconnected', () => {
    console.log('Disconnected, attempting reconnect every 10 seconds');
    setTimeout(connect, 10000);
})

function update() {
    const state = `Perseverance - Sol ${getMissionSol()}`;
    const details = `Location: Jezero Crater`;
    const buttons = [
        {
            label: 'Read about Sol (Mars day)!',
            url: 'https://en.wikipedia.org/wiki/Sol_(day_on_Mars)',
        },
        {
            label: 'Where is Perseverance!',
            url: 'https://mars.nasa.gov/mars2020/mission/where-is-the-rover/',
        },
    ];

    rpcClient.setActivity({
        state,
        details,
        startTimestamp: landingTimestamp,
        largeImageKey: 'ps',
        largeImageText: 'Nasa is running this mission!',
        buttons,
    }).catch(console.error);
}

function connect() {
    rpcClient._connectPromise = undefined;
    rpcClient.login({ clientId })
        .then(() => console.log('RPC Connected.'))
        .catch(console.error);
}

connect();