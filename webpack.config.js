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
  node: {
    global: true
  },
  plugins:[
    new UglifyJSPlugin({
      test: /\-min\.js$/
    })
  ]
};
