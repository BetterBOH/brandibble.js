const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'whatwg-fetch',
    './lib/brandibble'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "brandibble.js",
    libraryTarget: 'umd'
  },
  resolve: {
    modules: [
      path.resolve(__dirname),
      'node_modules'
    ],
    extensions: ['.js', '.json'],
    alias: { brandibble: 'lib' }
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        include: /lib/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin(['API_KEY'])
  ]
};
