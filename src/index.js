var WebSocket = require('ws');
var rimraf = require('rimraf');
var Vagrant = require('./vagrant');
var temperature = require('./temperature');
var message = require('./message');

var wss = new WebSocket.Server({port:8080});
var machine = null;

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port 8080');

  machine = new Vagrant('./esperimage/');
  machine.up((err) => {
    console.log(err);
  });
});

wss.on('connection', (ws) => {
  console.log('[WebSocketServer] WebSocket connected to server');

  ws.on('message', (data) => {
    console.log('[WebSocket] WebSocket received message');
    console.log(data);

    var incomingMessage = message.Message.fromJson(data);
    switch (incomingMessage.header.type) {
      case message.Constants.CepEngineReady:
        temperature.start(50);
        break;
    }
  });

  ws.send(new message.SetupCepEngineMessage().toJson());
});

process.stdin.resume();

function cleanup() {
  console.log('Cleaning up before exit...');

  if (wss) {
    wss.close();
  }

  if (machine) {
    console.log('Cleaning machine');
    machine.killChildProcess((err) => {
      if (err) {
        throw err;
      }
      console.log('Killed child process');

      machine.destroy((err) => {
        if (err) {
          throw err;
        }
        console.log('Machine Destroyed');

        rimraf(machine.machineFolder, (err) => {
          if (err) {
            throw err;
          }

          console.log('Clean up successful!');
          process.exit();
        });
      });
    });
  } else {
    process.exit();
  }
}

process.on('SIGINT', cleanup);
process.on('uncaughtException', cleanup);
