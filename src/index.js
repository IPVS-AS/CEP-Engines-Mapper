var fs = require('fs');
var path = require('path');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var vagrant = require('node-vagrant');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var machine = null;
var app = null;

const MachineState = {
  Provisioning: 'Provisioning',
  Benchmarking: 'Benchmarking',
  Finished: 'Finished'
};

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

    machine.state = MachineState.Provisioning;
    app.broadcast(
      new message.UpdateConsoleMessage({ machineState: machine.state }).toJson()
    );

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

  app = new App(3000);

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
          machine.state = MachineState.Benchmarking;
          app.broadcast(
            new message.UpdateConsoleMessage({
              machineState: machine.state
            }).toJson()
          );
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
                    .getFile(
                      path.join(__dirname, 'benchmark.log'),
                      '/home/ubuntu/benchmark.log'
                    )
                    .then(
                      () => {
                        console.log('[WebSocket] Benchmark log get successful');
                        console.log('[Vagrant] Destroy machine');
                        machine.destroy((err, out) => {
                          if (err) {
                            console.log(err);
                          }

                          console.log(out);

                          fs.readFile(
                            path.join(__dirname, 'benchmark.log'),
                            (err, data) => {
                              if (err) {
                                console.log(err);
                              }

                              var logEvents = data
                                .toString()
                                .split('\n')
                                .filter(x => x)
                                .map(JSON.parse);

                              var results = [];

                              logEvents.forEach(logEvent => {
                                results.push({
                                  timestamp: logEvent.timestamp,
                                  statement: JSON.parse(logEvent.message)
                                    .statement
                                });
                              });

                              machine.state = MachineState.Finished;
                              app.broadcast(
                                new message.UpdateConsoleMessage({
                                  machineState: machine.state,
                                  results: results
                                }).toJson()
                              );
                            }
                          );
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
