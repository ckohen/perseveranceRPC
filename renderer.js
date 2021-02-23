'use strict';

function setDisconnected() {
  document.getElementById("connectText").innerHTML = "Disconnected";
  document.getElementById("connectImg").src = "disconnected.png";
}

function setConnected() {
  document.getElementById("connectText").innerHTML = "Connected";
  document.getElementById("connectImg").src = "connected.png";
}

function startup(version, location) {
  document.getElementById("versionId").innerHTML = version;
  document.getElementById("location").value = location;
}

async function updateLocation() {
  const { ipcRenderer } = require('electron');
  const location = document.getElementById('location').value;
  const success = ipcRenderer.sendSync('updateLocation', location);
  const successElem = document.getElementById("success")
  if (success) {
    successElem.src = "connected.png";
    await unfade(successElem, 2);
    fade(successElem, 50);
  } else {
    successElem.src = "disconnected.png";
    await unfade(successElem, 2);
    fade(successElem, 50);
  }
}

function reconnect() {
  const { ipcRenderer } = require('electron');
  ipcRenderer.sendSync('reconnect', 'trigger');
}

function fade(element, rate) {
  let op = 1;
  return new Promise(resolve => {
    const timer = setInterval(function () {
      if (op <= 0.1) {
        clearInterval(timer);
        element.style.display = 'none';
        resolve(true);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op -= op * 0.1;
    }, rate);
  });
}

function unfade(element, rate) {
  let op = 0.1;
  element.style.display = 'inline';
  return new Promise(resolve => {
    const timer = setInterval(function () {
      if (op >= 1) {
        clearInterval(timer);
        resolve(true);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op += op * 0.1;
    }, rate);
  });
}