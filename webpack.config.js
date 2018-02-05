const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: {
    "things-scene-visualizer": "./src/index.js",
    "things-scene-visualizer-min": "./src/index.js"
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, '.')
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'bower_components')
    ]
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: [],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ["env"]
        }
      }]
    }]
  },
  devServer: {
    contentBase: path.join(__dirname, '.'),
    compress: true,
    port: 9000
  },
  plugins: [
    new UglifyJSPlugin({
      test: /\-min\.js$/
    })
  ]
};
