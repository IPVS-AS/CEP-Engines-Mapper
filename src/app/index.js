require('babel-register');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var EventEmitter = require('events');
var bodyParser = require('body-parser');
var Server = React.createFactory(require('./server').default);

class App extends EventEmitter {
  constructor(port) {
    super();
    var app = express();

    app.use(bodyParser.json());

    if (process.env.NODE_ENV === 'development') {
      var webpack = require('webpack');
      var webpackConfig = require('./webpack.config');

      var compiler = webpack(webpackConfig);

      app.use(
        require('webpack-dev-middleware')(compiler, {
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

    var template = body => {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>CEP Engine Benchmarking</title>
          </head>

          <body>
            <div id="root">${body}</div>
          </body>

          <script src="/static/bundle.js"></script>
        </html>
      `;
    };

    app.get('*', (req, res) => {
      var context = {};
      var markup = ReactDOMServer.renderToString(
        Server({
          location: req.url,
          context: context,
          userAgent: req.headers['user-agent']
        })
      );
      res.send(template(markup));
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
