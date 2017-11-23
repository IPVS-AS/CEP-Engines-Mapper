var config = require('config');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var Openstack = require('./openstack');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var app = null;
var instances = {};

var wss_port = config.get('server.wss_port');
var wss = new WebSocket.Server({ port: wss_port });

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port ' + wss_port);

  app = new App(config.get('app.port'));

  app.on('message', data => {
    console.log('[App] Received message');
    console.log(data);

    try {
      var msg = message.Message.fromJson(data);
      switch (msg.type) {
        case message.Constants.SetupCepEngine:
          var instance = new Openstack.Instance(
            msg.broker,
            msg.endEventName,
            msg.events,
            msg.statements
          );
          instances[instance.name] = instance;
          app.broadcast(
            new message.CreateInstanceMessage(
              instance.name,
              instance.state
            ).toJson()
          );

          instance.on('changeState', state => {
            app.broadcast(
              new message.UpdateInstanceMessage(
                instance.name,
                instance.state
              ).toJson()
            );
          });

          instance.on('finished', results => {
            app.broadcast(
              new message.UpdateInstanceMessage(
                instance.name,
                instance.state
              ).toJson()
            );
          });

          instance.on('destroyed', () => {
            delete instances[instance.name];
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
      var msg = message.Message.fromJson(data);
      switch (msg.type) {
        case message.Constants.InstanceReady:
          var instanceName = msg.instanceName;
          if (instances.hasOwnProperty(instanceName)) {
            ws.send(
              new message.SetupCepEngineMessage(
                instances[instanceName].broker,
                instances[instanceName].endEventName,
                instances[instanceName].events,
                instances[instanceName].statements
              ).toJson()
            );
          }
          break;
        case message.Constants.CepEngineReady:
          var instanceName = msg.instanceName;
          if (instances.hasOwnProperty(instanceName)) {
            instances[instanceName].changeState(
              Openstack.Constants.State.Benchmarking
            );
          }
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
});

process.stdin.resume();

function cleanup() {
  console.log('Cleaning up before exit...');

  if (wss) {
    wss.close();
  }

  for (var name in instances) {
    if (instances.hasOwnProperty(name)) {
      instances[name].destroy();
    }
  }
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
