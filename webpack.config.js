const path = require('path')

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
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: 11
                }
              }
            ]
          ],
          plugins: [['@babel/plugin-proposal-export-default-from']]
        }
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
  devtool: 'cheap-module-source-map'
}
