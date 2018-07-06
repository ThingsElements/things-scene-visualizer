const path = require('path')

const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    'things-scene-visualizer': ['./src/index.js']
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js'
  },
  resolve: {
    modules: ['./node_modules']
  },
  resolveLoader: {
    modules: ['./node_modules']
  },
  externals: {
    '@hatiolab/things-scene': 'scene'
  },
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  'env',
                  {
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
        ]
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        resourceQuery: /3d/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              emitFile: false
            }
          }
        ]
      },
      {
        test: /\.(gif|jpe?g|png)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240,
              name: '[path][name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        test: /obj[\w\/]+\.\w+$/,
        exclude: /\.json$/,
        resourceQuery: /3d/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              emitFile: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new UglifyJsPlugin({
      test: /\-min\.js$/
    })
  ],
  devtool: 'cheap-module-source-map'
}
