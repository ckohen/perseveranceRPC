# PerseveranceRPC
Quick Discord RPC application for perseverance landing

## Downloading
```bash
git clone https://github.com/ckohen/perseveranceRPC.git
cd perseveranceRPC/
```
or
1. Download the project from [here](https://github.com/ckohen/perseveranceRPC/archive/main.zip),
2. Unzip the folder and open it,
3. Make sure [NODE.JS](https://nodejs.org/en/) is installed,
4. Open the folder in CMD/Powershell and go to the [Installation](#Installation).

## Installation
```bash
npm i
```

## Running Project
```bash
node index.js
```
### PM2 alternative
Install PM2 with
```bash
npm install pm2 -g
```
Run the app by executing the following command in the project's directory
```bash
pm2 start index.js --name discordrpc
```
If you close the terminal window the project will keep running.
To stop the RPC use
```bash
pm2 stop discordrpc
```


## License
[MIT](https://github.com/ckohen/perseveranceRPC/blob/main/LICENSE)
