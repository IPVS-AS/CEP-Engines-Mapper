var webpack = require('webpack');

module.exports = {
  entry: __dirname + '/src/app/client.js',
  output: {
    path: __dirname + '/src/app/static',
    publicPath: '/static/',
    filename: 'app.js'
  },
  resolve: {
    extensions: ['.js', '.elm', '.css']
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
  }
};
