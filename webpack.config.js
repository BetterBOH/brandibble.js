const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: [
    'whatwg-fetch',
    './src/brandibble',
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
    alias: { brandibble: 'src' },
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, 'spec'),
        ],
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin(['BRANDIBBLE_API_KEY']),
  ],
};
