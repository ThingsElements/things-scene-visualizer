const path = require('path');

const webpack = require('webpack');
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    "things-scene-visualizer": ['./src/index.js']
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
  },
  resolve: {
    modules: ['./node_modules']
  },
  resolveLoader: {
    modules: ['./node_modules']
  },
  externals: {
    "@hatiolab/things-scene": "scene"
  },
  optimization: {
    minimize: false,
    // minimize: true,
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              'es2015', {
                targets: {
                  browsers: ['last 2 Chrome versions', 'Safari 10']
                },
                debug: true
              }
            ]
          ],
          plugins: []
        }
      }
    }, {
      test: /\.json$/,
      type: 'javascript/auto',
      resourceQuery: /3d/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          emitFile: false
        }
      }]
    }, {
      test: /\.(gif|jpe?g|png)$/,
      loader: 'url-loader?limit=25000',
      query: {
        limit: 10000,
        name: '[path][name].[hash:8].[ext]',
        emitFile: false
      }
    }, {
      test: /obj[\w\/]+\.\w+$/,
      exclude: /\.json$/,
      resourceQuery: /3d/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
          emitFile: false
        }
      }]
    }]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new UglifyJsPlugin({
      test: /\-min\.js$/
    })
  ],
  devtool: 'cheap-module-source-map'
}
