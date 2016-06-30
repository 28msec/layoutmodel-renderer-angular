'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var Config = {
    path: {
        app: 'app',
        tmp: '.tmp',
        index: 'app/index.html'
    }
};

gulp.task('build', function () {
    var assets = $.useref.assets({ searchPath: '{' + Config.paths.app + ',' + Config.paths.tmp + '}' });
    return gulp.src(Config.paths.index)
        .pipe(assets)
        .pipe($.if('**/scripts.js', $.ngAnnotate()))
        .pipe($.if('**/scripts.js', $.uglify({ compress: false })))
        //.pipe($.sourcemaps.init())
        .pipe($.if(Config.paths.css, $.csso()))
        .pipe($.rev())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe($.if('*.html', $.minifyHtml({
            empty: true
        })))
        //.pipe($.sourcemaps.write())
        .pipe(gulp.dest(Config.paths.dist))
        .pipe($.size({
            title: 'html'
        }));
});

gulp.task('default', ['build']);