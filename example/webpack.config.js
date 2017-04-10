const webpack = require('webpack')

module.exports = {
  entry: __dirname + '/index.js',
  output: {
    path: __dirname + '/',
    filename: 'index.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['es2015']
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.common.js'
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};