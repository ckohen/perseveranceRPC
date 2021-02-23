'use strict'

// Global
const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const { Client } = require('discord-rpc');
const julian = require('julian');
const { autoUpdater } = require('electron-updater');

let connected = false;
let minimized = false;
let electronWindow;
let tray;
let location = 'Jezero Crater';

// App
function createWindow() {
  electronWindow = new BrowserWindow({
    backgroundColor: '#36393f',
    closable: false,
    fullscreenable: false,
    icon: 'percy.png',
    width: 340,
    height: 380,
    resizable: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      zoomFactor: 1.0,
    },
  });
  electronWindow.loadFile('index.html');

  electronWindow.on('minimize', event => {
    event.preventDefault();
    electronWindow.hide();
    minimized = true;
  });

  electronWindow.on('restore', () => {
    electronWindow.show();
    minimized = false;
    if (connected) {
      electronWindow.webContents.executeJavaScript('setConnected();');
    } else {
      electronWindow.webContents.executeJavaScript('setDisconnected();');
    }
  });
  
  electronWindow.webContents.executeJavaScript(`startup('${app.getVersion()}', '${location}');`);
}

function createTray() {
  const icon = path.join(__dirname, 'percy.png');
  const appIcon = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        electronWindow.show();
        minimized = false;
        if (connected) {
          electronWindow.webContents.executeJavaScript('setConnected();');
        } else {
          electronWindow.webContents.executeJavaScript('setDisconnected();');
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        electronWindow.destroy();
      }
    },
  ]);

  appIcon.on('double-click', () => {
    electronWindow.show();
  });
  appIcon.setToolTip('Perseverance RPC');
  appIcon.setContextMenu(contextMenu);
  tray = appIcon;
}

Menu.setApplicationMenu(Menu.buildFromTemplate([
  {
    label: 'Options',
    submenu: [
      {
        role: 'toggleDevTools',
      },
      {
        label: 'Quit',
        click: () => {
          electronWindow.destroy();
        }
      },
    ]
  },
]));

ipcMain.on('updateLocation', (event, arg) => {
  location = arg;
  update();
  event.returnValue = true;
});

ipcMain.on('reconnect', () => {
  forceReconnect();
});

app.on('ready', () => {
  createWindow();
  createTray();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  app.quit();
})

app.on('activate', () => {
  if (electronWindow === null) {
    createWindow();
  }
});

app.on('quit', () => console.log("Quitting"));

// RPC
const clientId = '811145575134658561';
const day = 24 * 60 * 60 * 1000;
const marsDay = 88775244;
const landingTimestamp = 1613681692000;
let forced = false;

function getMSD(earthTimestamp) {
  return (julian(earthTimestamp) - 2451549.5) / 1.0274912517 + 44796;
}

function getMission() {
  const date = Date.now();
  const diff = getMSD(date) - getMSD(landingTimestamp);
  const sol = Math.floor(diff);
  const percentage = (diff * 100 - sol * 100).toFixed(2);
  const totalSol = sol * marsDay;
  const solTimestamp = landingTimestamp + totalSol;
  let countDown = false;
  let timestamp = solTimestamp;
  if ((timestamp + day) < date) {
    countDown = true;
    timestamp += marsDay;
  }

  return {
    sol,
    percentage,
    countDown,
    timestamp,
  }
}

const rpcClient = new Client({ transport: 'ipc' });
let updateInterval;

rpcClient.on('ready', () => {
  update();
  updateInterval = setInterval(update, 10 * 1000);
  connected = true;
  if (!minimized && electronWindow) {
    electronWindow.webContents.executeJavaScript('setConnected();');
  }
});

rpcClient.on('disconnected', () => {
  connected = false;
  if (!minimized && electronWindow) {
    electronWindow.webContents.executeJavaScript('setDisconnected();');
  }
  clearInterval(updateInterval);
  updateInterval = null;
  console.log('Disconnected, attempting reconnect every 10 seconds');
  if (forced) {
    forced = false;
    console.log('Forced disconnect, fast tracking reconnect');
    setTimeout(connect, 1000);
  } else {
    setTimeout(connect, 10000);
  }
})

function update() {
  const missionInfo = getMission();
  const state = `Perseverance - Sol ${missionInfo.sol} (${missionInfo.percentage}%)`;
  const details = `Location: ${location}`;
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
    startTimestamp: missionInfo.timestamp,
    endTimestamp: missionInfo.countDown ? missionInfo.timestamp : undefined,
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

function forceReconnect() {
  forced = true;
  rpcClient.destroy();
}

connect();