var fs = require('fs');
var rollup = require('rollup');
var uglify = require('uglify-js');
var buble = require('@rollup/plugin-buble');
var uglify = require('rollup-plugin-uglify').uglify;
var rollupBanner = require('rollup-plugin-banner').default;
var package = require('../package.json');

var banner =
  'vue-authenticate v' +
  package.version +
  '\n' +
  'https://github.com/dgrubelic/vue-authenticate\n' +
  'Released under the MIT License.\n';

function buildSource(inputOptions, outputOptions) {
  rollup.rollup(inputOptions).then(function (bundle) {
    return bundle.generate(outputOptions).then(function (output) {
      bundle.write(outputOptions);
    });
  });
}

buildSource(
  {
    input: 'src/index.js',
    plugins: [buble(), rollupBanner(banner)],
  },
  {
    file: 'dist/vue-authenticate.js',
    format: 'umd',
    name: 'VueAuthenticate',
  }
);

buildSource(
  {
    input: 'src/index.js',
    plugins: [buble(), uglify(), rollupBanner(banner)],
  },
  {
    file: 'dist/vue-authenticate.min.js',
    format: 'umd',
    name: 'VueAuthenticate',
  }
);

buildSource(
  {
    input: 'src/index.js',
    plugins: [rollupBanner(banner)],
  },
  {
    file: 'dist/vue-authenticate.esm.js',
    format: 'es',
  }
);

buildSource(
  {
    input: 'src/index.js',
    plugins: [rollupBanner(banner)],
  },
  {
    file: 'dist/vue-authenticate.common.js',
    format: 'cjs',
  }
);

// rollup.rollup({
//   input: 'src/index.js',
//   plugins: [buble()]
// })
//   .then(function (bundle) {
//     return bundle.write('dist/vue-authenticate.js', bundle.generate({
//       format: 'umd',
//       banner: banner,
//       name: 'VueAuthenticate'
//     }).code, bundle);
//   })
//   .then(function (bundle) {
//     return bundle.write('dist/vue-authenticate.min.js',
//       banner + '\n' + uglify.minify('dist/vue-authenticate.js').code,
//       bundle);
//   })
//   .then(function (bundle) {
//     return bundle.write('dist/vue-authenticate.es2015.js', bundle.generate({
//       format: 'es',
//       banner: banner,
//       footer: 'export { VueAuthenticate };'
//     }).code, bundle);
//   })
//   .then(function (bundle) {
//     return bundle.write('dist/vue-authenticate.common.js', bundle.generate({
//       format: 'cjs',
//       banner: banner
//     }).code, bundle);
//   })
//   .catch(logError);

function write(dest, code, bundle) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) return reject(err);
      console.log(blue(dest) + ' ' + getSize(code));
      resolve(bundle);
    });
  });
}

function getSize(code) {
  return (((code && code.length) || 0) / 1024).toFixed(2) + 'kb';
}

function logError(e) {
  console.log(e);
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}
