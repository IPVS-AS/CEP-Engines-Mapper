var webpack = require('webpack');
var path = require('path');

var entry = __dirname + '/client.js';
var plugins = [];

if (process.env.NODE_ENV === 'development') {
  entry = [
    'webpack-hot-middleware/client?reload=true',
    __dirname + '/client.js'
  ];
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  entry: entry,
  output: {
    path: __dirname + '/static',
    publicPath: '/static/',
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        loader: 'elm-webpack-loader?verbose=true&warn=true'
      }
    ],
    noParse: /\.elm$/
  },
  plugins: plugins
};
