var fs = require('fs');
var ip = require('ip');
var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var EventEmitter = require('events');
var config = require('config');

class App extends EventEmitter {
  constructor(port) {
    super();
    var app = express();

    app.use('/static', express.static(__dirname + '/static'));

    if (process.env.NODE_ENV === 'development') {
      var webpack = require('webpack');
      var webpackConfig = require('../../dev.config');
      var compiler = webpack(webpackConfig);
      app.use(
        require('webpack-dev-middleware')(compiler, {
          noInfo: false,
          publicPath: webpackConfig.output.publicPath
        })
      );

      app.use(require('webpack-hot-middleware')(compiler));
    }

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/static/client.html');
    });

    this.server = http.createServer(app);

    this.wss = new WebSocket.Server({ server: this.server, path: '/' });
    this.wss.on('listening', () => {
      console.log('[Express] WebSocketServer started listening');
    });

    this.wss.on('connection', ws => {
      console.log('[Express] WebSocketClient connected');

      ws.on('message', data => {
        this.emit('message', ws, data);
      });

      ws.on('close', (code, reason) => {
        console.log('[Express] Connection closed: ' + code + ' ' + reason);
      });
    });

    this.server.listen(port, () => {
      console.log('[Express] Server listening on port ' + port);
    });
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  close() {
    this.wss.close();
    this.server.close();
  }
}

module.exports = App;
