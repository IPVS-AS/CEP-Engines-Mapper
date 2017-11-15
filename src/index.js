var fs = require('fs');
var path = require('path');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var Openstack = require('./openstack');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var app = null;
var instance = null;

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
          instance = new Openstack.Instance(incomingMessage);

          instance.on('changeState', state => {
            app.broadcast(
              new message.UpdateConsoleMessage({
                machineState: state
              }).toJson()
            );

            switch (state) {
              case Openstack.Constants.State.Finished:
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

                    app.broadcast(
                      new message.UpdateConsoleMessage({
                        machineState: state,
                        results: results
                      }).toJson()
                    );
                  }
                );
                break;
            }
          });

          instance.create(
            () => {},
            err => {
              console.log(err);
            }
          );
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
          instance.changeState(Openstack.Constants.State.Benchmarking);
          temperature.start(50);
          break;
        case message.Constants.BenchmarkEnd:
          ws.send(new message.ShutdownMessage().toJson());
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on('close', (code, reason) => {
    console.log('[WebSocket] Connection closed: ' + code + ' ' + reason);
  });

  ws.send(instance.config.toJson());
});

process.stdin.resume();

function cleanup() {
  console.log('Cleaning up before exit...');

  if (wss) {
    wss.close();
  }

  if (instance) {
    instance.destroy(
      () => {
        process.exit();
      },
      err => {
        process.exit();
      }
    );
  } else {
    process.exit();
  }
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
