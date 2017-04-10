var version = require('./package.json').version;
var babel = require('rollup-plugin-babel');

module.exports = {
  entry: 'src/index.js',
  dest: 'dist/vue-authenticate.js',
  sourceMap: 'dist/vue-authenticate.map',
  banner: '/**\n * vue-authenticate ' + version + '\n * (c) 2016 Davor Grubelić \n * License: MIT \n */\n',
  format: 'umd',
  moduleName: 'vue-authenticate',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  exports: 'named'
}