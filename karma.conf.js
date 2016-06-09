const webpack         = require('webpack');
const webpackConfig   = require('./webpack.config');
webpackConfig.devtool = 'inline-source-map';

module.exports = function (config) {
  config.set({
    browsers: ['Chrome'],
    singleRun: !!process.env.CI,
    frameworks: ['mocha', 'chai'],
    files: ['spec/**/*.spec.js'],
    plugins: [
      'karma-chrome-launcher',
      'karma-chai',
      'karma-mocha',
      'karma-sourcemap-loader',
      'karma-webpack'
    ],
    preprocessors: {
      'spec/**/*.spec.js': [ 'webpack', 'sourcemap' ] 
    },
    colors: true,
    logLevel: config.LOG_INFO,
    reporters: ['progress'],
    webpack: webpackConfig,
    webpackServer: { noInfo: false },
    client: {
      mocha: {
        timeout: 5000,
        reporter: 'html'
      } 
    }
  });
};
