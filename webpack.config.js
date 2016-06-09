const webpack = require('webpack');

module.exports = {  
  entry: [
    'whatwg-fetch',
    './lib/Brandibble'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "Brandibble.js",
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
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
