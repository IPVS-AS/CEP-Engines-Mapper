var config = require('config');
var WebSocket = require('ws');
var node_ssh = require('node-ssh');
var ssh = new node_ssh();
var Openstack = require('./openstack');
var MongoDB = require('./mongodb');
var temperature = require('./temperature');
var message = require('./message');
var App = require('./app');

var app = null;
var benchmarks = {};

var wss_port = config.get('server.wss_port');
var wss = new WebSocket.Server({ port: wss_port });

wss.on('listening', () => {
  console.log('[WebSocketServer] Started listening on port ' + wss_port);

  app = new App(config.get('app.port'));

  app.on('message', (ws, data) => {
    console.log('[App] Received message');
    console.log(data);

    try {
      var msg = message.Message.fromJson(data);
      switch (msg.type) {
        case message.Constants.SubmitForm:
          var benchmark = new Openstack.Benchmark(
            msg.broker,
            msg.endEventName,
            msg.instances
          );

          // add benchmark to db
          MongoDB.insertBenchmark(benchmark);

          benchmarks[benchmark.name] = benchmark;
          console.log('New benchmark: ' + benchmark.name);

          benchmark.on('changeState', (instanceName, state) => {
            console.log(benchmark.name + '/' + instanceName + ':' + state);
          });

          benchmark.on('ready', () => {
            temperature.start(
              benchmark.broker,
              config.get('temperature_samples')
            );
          });

          MongoDB.findBenchmarks(benchmarks => {
            ws.send(new message.BenchmarksMessage(benchmarks).toJson());
          });

          benchmark.start();
          break;

        case message.Constants.RefreshBenchmarks:
          MongoDB.findBenchmarks(benchmarks => {
            ws.send(new message.BenchmarksMessage(benchmarks).toJson());
          });
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
          if (benchmarks.hasOwnProperty(msg.benchmark)) {
            var benchmark = benchmarks[msg.benchmark];

            if (benchmark.instances.hasOwnProperty(msg.instance)) {
              var instance = benchmark.instances[msg.instance];

              ws.send(
                new message.SetupCepEngineMessage(
                  benchmark.broker,
                  benchmark.endEventName,
                  instance.engine,
                  instance.config
                ).toJson()
              );
            }
          }
          break;
        case message.Constants.CepEngineReady:
          if (benchmarks.hasOwnProperty(msg.benchmark)) {
            var benchmark = benchmarks[msg.benchmark];
            benchmark.readyInstance(msg.instance);
          }
          break;
        case message.Constants.BenchmarkEnd:
          ws.send(new message.ShutdownMessage().toJson());
          break;
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on('error', err => {
    console.log(err);
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

  if (app) {
    app.close();
  }

  if (Object.keys(benchmarks).length == 0) {
    process.exit(0);
  }

  for (var b in benchmarks) {
    if (benchmarks.hasOwnProperty(b)) {
      benchmarks[b].destroyAll(err => {
        if (err) {
          process.exit(1);
        }

        process.exit(0);
      });
    }
  }
}

process.on('SIGINT', cleanup);
//process.on('uncaughtException', cleanup);
