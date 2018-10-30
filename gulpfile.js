var gulp = require('gulp');

var connect = require('gulp-connect-php');
var sync = require('browser-sync');

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var paths = {
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
var sassOptions = {
    includePaths: paths.sass.lib,
    outputStyle: 'expanded'
}

// Set the browsers we want our SASS compiler to target
var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 2%', 'Firefox ESR']
};

// Built-in PHP server options
var connectOptions = {
    base: '../../../',
    router: 'system/router.php',
    host: '127.0.0.1',
    port: 8000,
    open: false,
    stdio: 'ignore'
};

// Browser-sync options, this will proxy requests and inject CSS changes.
var syncOptions = {
    files: [
        paths.stylesheets,
        paths.scripts
    ],
    notify: false,
    open: false,
    proxy: connectOptions.host + ':' + connectOptions.port,
    reloadDelay: 1000
}

gulp.task('sass', function() {
    // Sourcemaps currently has an issue
    // https://github.com/scniro/gulp-clean-css/issues/1
    return gulp
        .src(paths.sass.src, { nodir: true })
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .on('error', sass.logError)
        .pipe(sourcemaps.write())
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(gulp.dest(paths.sass.out))
        .pipe(sync.stream());
});

gulp.task('connect-sync', function() {
    // Start up our PHP server and inject the Browsersync js
    connect.server(connectOptions, function(){
        sync(syncOptions);
    });
});

gulp.task('sync-reload', function() {
    sync.reload();
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.sass.src, ['sass']);
    gulp.watch(paths.templates, ['sync-reload']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['sass', 'connect-sync', 'watch']);
