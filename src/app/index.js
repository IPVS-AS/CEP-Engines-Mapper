var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var EventEmitter = require('events');

class App extends EventEmitter {
  constructor(port) {
    super();
    var app = express();

    if (process.env.NODE_ENV === 'development') {
      var webpack = require('webpack');
      var webpackConfig = require('./webpack.config');

      var compiler = webpack(webpackConfig);

      app.use(
        require('webpack-dev-middleware')(compiler, {
          publicPath: '/static/',
          hot: true,
          stats: {
            colors: true
          }
        })
      );

      app.use(require('webpack-hot-middleware')(compiler));

      app.get('/static/style.css', (req, res) => {
        res.sendFile(__dirname + '/static/style.css');
      });
    } else {
      app.use('/static', express.static(__dirname + '/static'));
    }

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/static/client.html');
    });

    var server = http.createServer(app);

    this.wss = new WebSocket.Server({ server: server, path: '/' });
    this.wss.on('listening', () => {
      console.log('[Express] WebSocketServer started listening');
    });

    this.wss.on('connection', ws => {
      console.log('[Express] WebSocketClient connected');

      ws.on('message', data => {
        this.emit('message', data);
      });

      ws.on('close', (code, reason) => {
        console.log('[Express] Connection closed: ' + code + ' ' + reason);
      });
    });

    server.listen(port, () => {
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
}

module.exports = App;
