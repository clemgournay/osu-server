
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const {spawn} = require('child_process');

const os = process.argv.indexOf('--win') >= 0 ? 'win' : 'unix';

const runMongo = () => {
  const port = 3001;
  console.log('[MONGO] trying to start mongod process');

  let dataDir = path.join('data', 'db'); 
  let lockfile = path.join(dataDir, 'mongod.lock');
  shell.rm('-f', lockfile);

  console.log(path.resolve(dataDir));

  console.log('[MONGO] trying to spawn mongod process with port: ' + port);

  const args = [
    '--dbpath', dataDir,
    '--port', port,
    '--bind_ip', '127.0.0.1'
  ];
  
  switch (os) {
    case 'unix':
      args.push('--fork');
      break;
  }

  console.log(dataDir);

  mongoProcess = spawn('mongod', args);

  mongoProcess.stdout.on('data', function (data) {
    console.log('[MONGOD-STDOUT]', data.toString());

    if (/waiting for connections/.test(data.toString())) {
      startServer();
    }
  });

  mongoProcess.stderr.on('data', function (data) {
    console.error('[MONGOD-STDERR]', data.toString());
  });

  mongoProcess.on('exit', function (code) {
    console.error('[MONGOD-EXIT]', code.toString());
  });
};
  

const startServer = () => {

  const process = spawn('node', ['app.js', 'command']);

  process.stdout.on('data', function (data) {
    console.log('[NODE-STDOUT]', data.toString());
  });

  process.stderr.on('data', function (data) {
    if (data) console.error('[NODE-STDERR]', data.toString());
  });

  process.on('exit', function (code) {
    if (code) console.error('[NODE-EXIT]', code.toString());
  });

    
}

runMongo();