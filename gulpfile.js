var gulp = require('gulp'),
    connect = require('gulp-connect'),
    webpack = require('webpack'),
    gulpWebpack = require('gulp-webpack'),
    history = require('connect-history-api-fallback')

gulp.task('compile', function () {
  var webpackConfig = require('./example/webpack.config.js')
  return gulp.src('./example/index.js')
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest('./example'))
    .pipe(connect.reload())
})

gulp.task('server', function () {
  connect.server({
    name: 'VueAuthentication',
    root: './example',
    base: 'example',
    port: 8080,
    livereload: true,
    verbose: true,
    middleware: function () {
      return [history()]
    }
  });
})

gulp.task('watch', function () {
  gulp.watch(['./example/index.js', './src/**/*.js'], ['compile'])
})

gulp.task('dev', ['server'])