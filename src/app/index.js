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

    fs.readFile(__dirname + '/static/client.html', (err, data) => {
      if (err) {
        console.log(err);
      }

      var server = 'ws://' + config.get('server.ip') + ':' + port;
      var html = data.toString().replace(/data-address/, '$&="' + server + '"');

      app.get('/', (req, res) => {
        res.send(html);
      });
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
