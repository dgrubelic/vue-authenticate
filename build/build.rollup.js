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
  rollup
    .rollup(inputOptions)
    .then(function (bundle) {
      return bundle.generate(outputOptions).then(function (output) {
        bundle.write(outputOptions);
      });
    })
    .catch(logError);
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

function logError(e) {
  console.error(e);
}

function getSize(code) {
  return (((code && code.length) || 0) / 1024).toFixed(2) + 'kb';
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}
