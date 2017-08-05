var WebSocket = require('ws');
var rimraf = require('rimraf');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
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

wss.on('connection', (ws, req) => {
  console.log('[WebSocketServer] WebSocket connected to server');
  console.log(req.connection.remoteAddress);
  var remoteAddress = req.connection.remoteAddress;

  ws.on('message', (data) => {
    console.log('[WebSocket] WebSocket received message');
    console.log(data);

    try {
      var incomingMessage = message.Message.fromJson(data);
      switch (incomingMessage.header.type) {
        case message.Constants.CepEngineReady:
          temperature.start(50, () => {
            ws.send(new message.BenchmarkEndMessage().toJson());

            ssh.connect({
              host: remoteAddress,
              username: 'ubuntu',
              privateKey: '/vagrant/id_rsa'
            }).then(() => {
              ssh.getFile('./benchmark.log', '/home/ubuntu/benchmark.log').then((contents) => {
                console.log('log downloaded');
              }, (err) => {
                console.log('log error');
              });
            });
          });
          break;
      }
    } catch (err) {
      console.log(err);
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
//process.on('uncaughtException', cleanup);
