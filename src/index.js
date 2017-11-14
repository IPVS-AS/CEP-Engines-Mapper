var fs = require('fs');
var path = require('path');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var Ansible = require('node-ansible');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');
var ip = require('ip');

var app = null;
var machine = {};

const MachineState = {
  Provisioning: 'Provisioning',
  Benchmarking: 'Benchmarking',
  Finished: 'Finished'
};

function createInstance(config) {
  machine.config = config;
  machine.playbook = new Ansible.Playbook()
    .playbook('openstack_deploy')
    .variables({
      instance_name: 'benchmarking',
      host_ip_address: ip.address()
    });

  machine.playbook.on('stdout', data => {
    console.log(data.toString());
  });

  machine.playbook.on('stderr', data => {
    console.log(data.toString());
  });

  machine.state = MachineState.Provisioning;
  app.broadcast(
    new message.UpdateConsoleMessage({ machineState: machine.state }).toJson()
  );

  machine.playbook.exec().then(
    () => {
      console.log('success');
    },
    err => {
      console.log(err);
    }
  );
}

function destroyInstance(instanceName, callback) {
  machine = {};
  var playbook = new Ansible.Playbook()
    .playbook('openstack_destroy')
    .variables({ instance_name: instanceName });

  playbook.on('stdout', data => {
    console.log(data.toString());
  });

  playbook.on('stderr', data => {
    console.log(data.toString());
  });

  playbook.exec().then(
    () => {
      callback(null);
    },
    err => {
      callback(err);
    }
  );
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
          createInstance(incomingMessage);
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
          temperature.start(200);
          break;
        case message.Constants.BenchmarkEnd:
          var getlog = new Ansible.Playbook()
            .playbook('openstack_getlog')
            .variables({ instance_name: 'benchmarking' });

          getlog.exec().then(
            () => {
              fs.readFile(
                path.join(__dirname, 'logs/benchmark.log'),
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
                    var message = JSON.parse(logEvent.message);
                    results.push({
                      timestamp: logEvent.timestamp,
                      statement: message.statement,
                      events: message.event
                    });
                  });

                  machine.state = MachineState.Finished;
                  app.broadcast(
                    new message.UpdateConsoleMessage({
                      machineState: machine.state,
                      results: results
                    }).toJson()
                  );

                  ws.send(new message.ShutdownMessage().toJson());
                }
              );
            },
            err => {
              console.log(err);
              destroyInstance('benchmarking', err => {
                if (err) {
                  console.log(err);
                }
              });
            }
          );
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('[WebSocket] Connection closed: ' + code + ' ' + reason);
    if (machine) {
      destroyInstance('benchmarking', err => {
        if (err) {
          console.log(err);
        }
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

  process.exit();

  destroyInstance('benchmarking', err => {
    if (err) {
      console.log(err);
    }
  });
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
