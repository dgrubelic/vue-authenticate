var gulp = require('gulp'),
    connect = require('gulp-connect')
    webpack = require('webpack'),
    gulpWebpack = require('gulp-webpack')
    history = require('connect-history-api-fallback')

gulp.task('compile', function () {
  var webpackConfig = require('./test/webpack.config.js')
  return gulp.src('./test/index.js')
    .pipe(gulpWebpack(webpackConfig, webpack))
    .pipe(gulp.dest('./test'))
    .pipe(connect.reload())
})

gulp.task('server', function () {
  connect.server({
    name: 'VueAuthentication',
    root: './test',
    base: 'test',
    port: 8080,
    livereload: true,
    verbose: true,
    middleware: function () {
      return [history()]
    }
  });
})

gulp.task('watch', function () {
  gulp.watch(['./test/index.js', './src/**/*.js'], ['compile'])
})

gulp.task('dev', ['compile', 'server', 'watch'])