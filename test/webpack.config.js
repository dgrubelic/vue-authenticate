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
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.common.js'
    }
  }
};