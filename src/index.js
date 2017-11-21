var config = require('config');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var Openstack = require('./openstack');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var app = null;
var instance = null;

var wss_port = config.get('server.wss_port');
var wss = new WebSocket.Server({ port: wss_port });

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port ' + wss_port);

  app = new App(config.get('app.port'));

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
          });

          instance.on('finished', results => {
            app.broadcast(
              new message.UpdateConsoleMessage({
                machineState: instance.state,
                results: results
              }).toJson()
            );
          });

          instance.on('destroyed', () => {
            instance = null;
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
          temperature.start(config.get('temperature_samples'));
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
