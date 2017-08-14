var fs = require('fs');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var vagrant = require('node-vagrant');
var temperature = require('./temperature');
var message = require('./message');

var wss = new WebSocket.Server({ port: 8080 });
var machine = null;

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port 8080');

  machine = new vagrant.create({ cwd: './esperimage/' });

  var Vagrantfile = JSON.parse(
    fs.readFileSync('./esperimage/Vagrantfile.json', 'utf8')
  );
  machine.init(null, Vagrantfile, (err, out) => {
    if (err) {
      throw new Error(err);
    }

    machine.on('progress', (...args) => {
      console.log('download progress: ', [].slice.call(args));
    });

    machine.on('up-progress', (...args) => {
      console.log('up progress: ', [].slice.call(args));
    });

    machine.up((err, out) => {
      if (err) {
        throw new Error(err);
      }

      console.log(out);
    });
  });
});

wss.on('connection', (ws, req) => {
  console.log('[WebSocketServer] WebSocket connected to server');
  console.log(req.connection.remoteAddress);
  var remoteAddress = req.connection.remoteAddress;

  ws.on('message', data => {
    console.log('[WebSocket] WebSocket received message');
    console.log(data);

    try {
      var incomingMessage = message.Message.fromJson(data);
      switch (incomingMessage.header.type) {
        case message.Constants.CepEngineReady:
          temperature.start(50);
          break;
        case message.Constants.BenchmarkEnd:
          ssh
            .connect({
              host: remoteAddress,
              username: 'ubuntu',
              privateKey: '/vagrant/id_rsa'
            })
            .then(() => {
              ssh.getFile('./benchmark.log', '/home/ubuntu/benchmark.log').then(
                contents => {
                  console.log('log downloaded');
                  ws.send(new message.ShutdownMessage().toJson());
                },
                err => {
                  console.log('log error');
                }
              );
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
    machine.destroy((err, out) => {
      console.log(err, out);
      process.exit();
    });
  }
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
