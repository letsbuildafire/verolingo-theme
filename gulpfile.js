"use strict";

console.time("Loading plugins");

const gulp = require('gulp');
const plumber = require("gulp-plumber");

const sync = require('browser-sync').create();

const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

const paths = {
    stylesheets: 'css/**/*.css',
    templates: 'templates/**/*.twig',
    lib: 'node_modules/**/*',
    sass: {
        src: 'scss/**/*',
        out: 'css/',
        lib: [
            'node_modules/',
        ]
    },
};

// SASS compiler options
const sassOptions = {
    includePaths: paths.sass.lib,
    outputStyle: 'expanded'
}

// Browser-sync options, this will proxy requests and inject CSS changes.
const syncOptions = {
    notify: true,
    open: false,
    proxy: '127.0.0.1:8080',
    reloadDelay: 1000,
    logLevel: "debug"
}

const styles = done => {
    return gulp
        .src(paths.sass.src, {nodir: true})
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .on('error', sass.logError)
        .pipe(autoprefixer())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.sass.out))
        .pipe(sync.stream());
};

const connect = done => {
    // Start up our PHP server and inject the Browsersync js
    sync.init(syncOptions);
    done();
};

const reload = done => {
    sync.reload();
    done();
}

// Rerun the task when a file changes
const watch = done => {
    gulp.watch(paths.templates, {usePolling: true, interval: 50},  reload);
    gulp.watch(paths.sass.src, {usePolling: true, interval: 50}, styles);
};

const dev = gulp.series(styles, gulp.parallel(connect, watch));

exports.styles = styles;
exports.connect = connect;
exports.watch = watch;
exports.default = dev;

console.timeEnd("Loading plugins");
