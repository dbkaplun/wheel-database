/*global require*/

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var reactify = require('reactify');
var rename = require('gulp-rename');
var less = require('gulp-less');
var flatten = require('gulp-flatten');

var path = require('path');

var dist = 'dist/';

gulp.task('build-js', function () {
  gulp.src('index.jsx')
    .pipe(browserify({transform: [reactify]}))
    .pipe(rename('index.js'))
    .pipe(gulp.dest(dist));
});
gulp.task('build-fonts', function() {
  gulp.src('**/*.{ttf,woff,eof,svg}')
    .pipe(flatten())
    .pipe(gulp.dest(dist));
});
gulp.task('build-less', ['build-fonts'], function () {
  gulp.src('index.less')
    .pipe(less({paths: []}))
    .pipe(gulp.dest(dist));
});
gulp.task('build', ['build-js', 'build-less', 'build-fonts']);

gulp.task('default', ['build']);
