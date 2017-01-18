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
  externals: {
    'react-native': 'react-native'
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js', '.json'],
    alias: { brandibble: 'lib' }
  },
  module: {
    loaders: [
      {include: /\.json$/, loaders: ["json-loader"]},
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: []
        }
      }
    ]
  },
  plugins: []
};
