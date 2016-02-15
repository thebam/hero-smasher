var gulp = require('gulp');
var jsHint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var jsFiles = ['*.js', 'src/public/javascript/herosmasher.js', 'src/routes/**/*.js'];
var cssFiles = ['./src/public/css/*.css', '!./src/public/css/*min.css'];
gulp.task('style', function () {
    return gulp.src(jsFiles)
        .pipe(jsHint())
        .pipe(jsHint.reporter('jshint-stylish', { verbose: true }))
        .pipe(jscs());
});


gulp.task('minify-css', function () {
    return gulp.src(cssFiles)
        .pipe(minifyCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./src/public/css'));
});

gulp.task('minify-js', function () {
    gulp.src(['./src/public/javascript/*.js', '!./src/public/javascript/*min.js']) // path to your files
    .pipe(uglify({ mangle: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./src/public/javascript'));
});

gulp.task('inject', function () {
    var wiredep = require('wiredep').stream;
    var inject = require('gulp-inject');

    var injectSrc = gulp.src(['./src/public/css/*.min.css', './src/public/javascript/*min.js'], { read: false });
    var injectOptions = {ignorePath:'/src/public'};
    var options = {
        bowerJson: require('./bower.json'),
        directory: './src/public/lib',
        ignorePath: '../public'
    };
    return gulp.src('./src/views/*ejs')
    .pipe(wiredep(options))
    .pipe(inject(injectSrc, injectOptions))
    .pipe(gulp.dest('./src/views'));
});

gulp.task('serve', ['style', 'minify-css', 'minify-js', 'inject'], function () {
    var options = {
        script: 'index.js',
        delayTime: 1,
        env: {
            'PORT': 5001
        },
        watch: [jsFiles,cssFiles]
    };

    return nodemon(options)
        .on('restart', function (ev) {
            console.log('Restarting...');
        });
});