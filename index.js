'use strict'

const { Client } = require('discord-rpc');
const julian = require('julian');

const clientId = '811145575134658561';
const day = 24 * 60 * 60;
let marsSol = 88775244;
const landingTimestamp = 1613681692;

function getMSD(earthTimestamp) {
    return (julian(earthTimestamp) - 2405522.0028779) / 1.0274912517;
}
function getMission() {
    const date = Date.now();
    let sol = Math.floor(getMSD(date) - getMSD(new Date(landingTimestamp * 1000).getTime()));
    let percentage = ((getMSD(date) - getMSD(new Date(landingTimestamp * 1000).getTime())) * 100 - sol * 100).toFixed(2);
    let _day = new Date(landingTimestamp * 1000);
    _day.setDate(_day.getDate() + sol);
    _day = new Date(_day.getTime() + new Date(day * percentage).getTime());

    return {
        sol,
        percentage,
        offset: _day.getTime()
    }
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
    const missionInfo = getMission();
    const state = `Perseverance - Sol ${missionInfo.sol} (${missionInfo.percentage}%)`;
    const details = `Location: Jezero Crater`;
    const buttons = [
        {
            label: 'Where is Perseverance!',
            url: 'https://mars.nasa.gov/mars2020/mission/where-is-the-rover/',
        },
        {
            label: 'Read about Sol (Mars day)!',
            url: 'https://en.wikipedia.org/wiki/Sol_(day_on_Mars)',
        }
    ];

    rpcClient.setActivity({
        state,
        details,
        startTimestamp: missionInfo.offset,
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