const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
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
    }, {
      // If you see a file that ends in .html, send it to these loaders.
      test: /\.html$/,
      // This is an example of chained loaders in Webpack.
      // Chained loaders run last to first. So it will run
      // polymer-webpack-loader, and hand the output to
      // babel-loader. This let's us transpile JS in our `<script>` elements.
      use: [
        { loader: 'babel-loader' },
        { loader: 'polymer-webpack-loader' }
      ]
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
    }),
    // This plugin will generate an index.html file for us that can be used
    // by the Webpack dev server. We can give it a template file (written in EJS)
    // and it will handle injecting our bundle for us.
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.ejs')
    }),
    // This plugin will copy files over to ‘./dist’ without transforming them.
    // That's important because the custom-elements-es5-adapter.js MUST
    // remain in ES2015. We’ll talk about this a bit later :)
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'bower_components/webcomponentsjs/*.js'),
      to: 'bower_components/webcomponentsjs/[name].[ext]'
    }])
  ]
};
