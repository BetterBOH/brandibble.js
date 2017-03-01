const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './lib/brandibble',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'brandibble.js',
    libraryTarget: 'umd',
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname),
    ],
    extensions: ['.js'],
    alias: { brandibble: 'lib' },
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        include: [
          path.join(__dirname, 'lib'),
          path.join(__dirname, 'spec'),
        ],
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['API_KEY']),
  ],
};
