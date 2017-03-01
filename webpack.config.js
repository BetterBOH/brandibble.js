const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'whatwg-fetch',
    './lib/brandibble',
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
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
        include: /lib/,
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['API_KEY']),
  ],
};
