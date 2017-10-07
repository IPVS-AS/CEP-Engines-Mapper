var fs = require('fs');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var vagrant = require('node-vagrant');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var machine = null;

function newBenchmark(config) {
  machine = new vagrant.create({ cwd: './esperimage/' });
  machine.config = config;

  var Vagrantfile = JSON.parse(
    fs.readFileSync('./esperimage/Vagrantfile.json', 'utf8')
  );
  machine.init(null, Vagrantfile, (err, out) => {
    if (err) {
      throw new Error(err);
    }

    machine.on('progress', out => {
      console.log('download progress: ', out);
    });

    machine.on('up-progress', out => {
      if (out != '\n') {
        console.log(
          'up progress: ',
          out.replace(/^(==>\s|\s*)default:\s|\n/g, '')
        );
      }
    });

    machine.up((err, out) => {
      if (err) {
        throw new Error(err);
      }

      console.log(out);
    });
  });
}

var wss = new WebSocket.Server({ port: 8080 });

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port 8080');

  var app = new App(3000);

  app.on('message', data => {
    console.log('[App] Received message');
    console.log(data);

    try {
      var incomingMessage = message.Message.fromJson(data);
      switch (incomingMessage.header.type) {
        case message.Constants.SetupCepEngine:
          newBenchmark(incomingMessage);
          break;
      }
    } catch (err) {
      console.log(err);
    }
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
          console.log('get log');
          machine.sshConfig((err, out) => {
            if (err) {
              console.log(err);
            }

            ssh
              .connect({
                host: remoteAddress,
                username: 'ubuntu',
                privateKey: out[0].private_key
              })
              .then(
                () => {
                  ssh
                    .getFile('./benchmark.log', '/home/ubuntu/benchmark.log')
                    .then(
                      contents => {
                        console.log('[WebSocket] Benchmark log get successful');
                        console.log('[Vagrant] Destroy machine');
                        machine.destroy((err, out) => {
                          if (err) {
                            console.log(err);
                          }

                          console.log(out);
                          machine = null;
                        });
                      },
                      err => {
                        console.log(err);
                      }
                    );
                },
                err => {
                  console.log(err);
                }
              );
          });
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('[WebSocket] Connection closed: ' + code + ' ' + reason);
    if (machine) {
      console.log('[Vagrant] Destroy machine');
      machine.destroy((err, out) => {
        if (err) {
          throw new Error(err);
        }

        console.log(out);
        machine = null;
      });
    }
  });

  ws.send(machine.config.toJson());
});

process.stdin.resume();

function cleanup() {
  console.log('Cleaning up before exit...');

  if (wss) {
    wss.close();
  }

  if (machine) {
    machine.destroy((err, out) => {
      if (err) {
        throw new Error(err);
      }

      console.log(out);
      machine = null;
    });
  }

  process.exit();
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
