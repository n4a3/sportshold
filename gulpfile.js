'use strict';

const
gulp          = require('gulp'),
pug           = require('gulp-pug'),
sass          = require('gulp-sass'),
bs            = require('browser-sync').create(),
sourcemaps    = require('gulp-sourcemaps'),
postcss       = require('gulp-postcss'),
autoprefixer  = require('autoprefixer'),
csso          = require('postcss-csso'),
del           = require('del'),
rename        = require('gulp-rename'),
concat        = require('gulp-concat'),
htmlreplace   = require('gulp-html-replace'),
imagemin      = require('gulp-imagemin'),
svgsprite     = require('gulp-svg-sprite'),
newer         = require('gulp-newer'),
notify        = require("gulp-notify"),
plumber       = require("gulp-plumber");

sass.compiler = require('node-sass');

//              html

gulp.task('html:watch', function() {
  return gulp.src('./source/*.pug')
  .pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return {
        title: 'html',
        message: err.message,
        time: 2000,
        type: 'error'
      };
    })
  }))
  .pipe(pug({pretty: true}))
  .pipe(gulp.dest('./build'));
});

gulp.task('html:build', function() {
  return gulp.src('./source/*.pug')
  .pipe(pug({pretty: true}))
  .pipe(htmlreplace({
    css: './css/main.min.css',
    js: './js/.min.js',               //https://www.npmjs.com/package/gulp-html-replace
  }))
  .pipe(gulp.dest('./build'));
});

//               css

gulp.task('css:watch', function() {
  return gulp.src('./source/**/*.{sass,scss}')
  .pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return {
        title: 'css',
        message: err.message,
        time: 2000,
        type: 'error'
      };
    })
  }))
  .pipe(gulp.dest('./build/css'))
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(postcss([autoprefixer]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./build/css'))
  .pipe(bs.reload({stream: true}));
});

gulp.task('css:build', function() {
  return gulp.src('./source/**/*.{sass,scss}')
  .pipe(sass())
  .pipe(concat('main.css'))
  .pipe(gulp.dest('./build/css'))
  .pipe(postcss([autoprefixer, csso]))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('./build/css'));
});

//           JavaScript

gulp.task('js:watch', function() {
  return gulp.src('./source/**/*.js')
  .pipe(gulp.dest('./build/js'));
});

//           svg sprite

gulp.task('sprite', function () {
  return gulp.src('./source/assets/img/sprite/**/*.svg')
  .pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return {
        title: 'sprite',
        message: err.message,
        time: 2000,
        type: 'error'
      };
    })
  }))
  .pipe(svgsprite({mode: {
    symbol: {
      dest: '.',
      sprite: 'sprite.svg'
    }
  }}))
  .pipe(gulp.dest('./build/img'));
})

//             images

gulp.task('images:build', function() {
  return gulp.src(['./source/assets/img/**/*.*', '!./source/assets/img/sprite/**/*.*'])
  .pipe(imagemin({verbose: true}))
  .pipe(gulp.dest('./build/img'))
})

//             assets

gulp.task('assets:watch', function() {
  return gulp.src(['./source/assets/**/*.*', '!./source/assets/img/sprite/*.*'])
  .pipe(plumber({
    errorHandler: notify.onError(function(err) {
      return {
        title: 'assets',
        message: err.message,
        time: 2000,
        type: 'error'
      };
    })
  }))
  .pipe(newer('./build'))
  .pipe(gulp.dest('./build'));
});

gulp.task('assets:build', function() {
  return gulp.src(['./source/assets/**/*.*', '!./source/assets/img/**/*.*'])
  .pipe(gulp.dest('./build'));
});

//           oooooooooo

gulp.task('serve', function() {

	bs.init({
		server: {
			baseDir: 'build'
		},
    notify: false
  });
  
  gulp.watch("./source/**/*.pug").on('change', gulp.series('html:watch', bs.reload));
  gulp.watch('./source/**/*.{sass,scss}', gulp.series('css:watch'));
  gulp.watch('./source/**/*.js').on('change', gulp.series('js:watch', bs.reload));
  gulp.watch(['./source/assets/**/*.*', '!./source/assets/img/sprite/*.*'], gulp.series('assets:watch'));
  gulp.watch('./source/assets/img/sprite/*.*', gulp.series('sprite'));
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('watch', gulp.series(
  'sprite',
  gulp.parallel('html:watch', 'css:watch', 'js:watch', 'assets:watch'),
  'serve'
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(gulp.series('sprite', 'html:build'), 'css:build', 'assets:build', 'images:build')
));

gulp.task('default', gulp.series('watch'));