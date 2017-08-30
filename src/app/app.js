require('babel-register');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var express = require('express');
var App = React.createFactory(require('./components/App').default);

var app = express();

app.set('port', 3000);

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

app.get('/', (req, res) => {
  var markup = ReactDOMServer.renderToString(App());
  res.send(template(markup));
});

app.listen(app.get('port'), () => {
  console.log('[Express] Server listening on port ' + app.get('port'));
});
