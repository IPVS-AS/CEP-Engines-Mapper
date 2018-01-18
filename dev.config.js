var webpack = require('webpack');

module.exports = {
  entry: [__dirname + '/src/app/client.js', 'webpack-hot-middleware/client'],
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
        use: [
          { loader: 'elm-hot-loader' },
          {
            loader: 'elm-webpack-loader?warn=true&verbose=true',
            options: {
              cwd: __dirname,
              forceWatch: true,
              debug: true
            }
          }
        ]
      }
    ],
    noParse: /\.elm$/
  },
  plugins: [new webpack.HotModuleReplacementPlugin()]
};
