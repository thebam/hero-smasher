var gulp = require('gulp');
var jsHint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var nodemon = require('gulp-nodemon');
var jsFiles = ['*.js', 'src/public/javascript/herosmasher.js', 'src/routes/**/*.js'];

gulp.task('style', function () {
    return gulp.src(jsFiles)
        .pipe(jsHint())
        .pipe(jsHint.reporter('jshint-stylish', { verbose: true }))
        .pipe(jscs());
});

gulp.task('inject', function () {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./src/public/css/*.css', './src/public/javascript/*.js'], { read: false });
    var injectOptions = {ignorePath:'/src/public'};
    var options = {
        bowerJson: require('./bower.json'),
        directory: './src/public',
        ignorePath: '../../src/public'
    };
    return gulp.src('./src/views/*ejs')
    .pipe(wiredep(options))
    .pipe(inject(injectSrc, injectOptions))
    .pipe(gulp.dest('./src/views'));
});

gulp.task('serve', ['style', 'inject'], function () {
    var options = {
        script: 'index.js',
        delayTime: 1,
        env: {
            'PORT': 5001
        },
        watch: jsFiles
    };

    return nodemon(options)
        .on('restart', function (ev) {
            console.log('Restarting...');
        });
});