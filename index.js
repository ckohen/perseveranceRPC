'use strict'

const { Client } = require('discord-rpc');
const julian = require('julian');
const moment = require('moment');

const clientId = '811145575134658561';
const day = 24 * 60 * 60;
const landingTimestamp = 1613681692;

function getMSD(earthTime) {
    earthTime = moment(earthTime).toDate();
    return (julian(earthTime) - 2405522.0028779) / 1.0274912517;
};
function getMissionSol() {
    let date = new Date().getTime();

    return Math.floor(getMSD(date) - getMSD(new Date(1613681692 * 1000).toISOString()));
}

console.log(new Date(1613681692 * 1000).toISOString());

console.log(getMissionSol());

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
    const currentTimestamp = Math.round(Date.now() / 1000);
    let state = `Perseverance - Sol ${getMissionSol()}`;
    let details = `Location: Jezero Crater`;
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