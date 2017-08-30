var webpack = require('webpack');
var path = require('path');

var entry = './client.js';
var plugins = [];

if (process.env.NODE_ENV === 'development') {
  entry = [
    'webpack-hot-middleware/client?reload=true',
    'react-hot-loader/patch',
    './client.js'
  ];
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = [
  {
    entry: entry,
    output: {
      path: __dirname + '/static',
      publicPath: '/static/',
      filename: 'bundle.js'
    },
    module: {
      loaders: [
        {
          test: /\.js[x]?$/,
          loader: 'babel-loader'
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    plugins: plugins
  }
];
