import gulp from 'gulp';

// Template Engine
import ejs from 'gulp-ejs';
import rename from 'gulp-rename';
import frontMatter from 'gulp-front-matter';
import wrapper from 'layout-wrapper';
import plumber from 'gulp-plumber';

// Postcss
import postcss from 'gulp-postcss';
import customProperties from 'postcss-custom-properties';
import customMedia from 'postcss-custom-media';
import Import from 'postcss-import';
import nested from 'postcss-nested';
import cssnano from 'cssnano';
import sourceMap from 'gulp-sourcemaps';

// JS
import browserify from 'browserify';
import sourceStream from 'vinyl-source-stream';

// Server
import browserSync, { reload, stream } from 'browser-sync';
import runSequence from 'run-sequence';

const path = {
  ejs: {
    layoutDir: `${__dirname}/src/ejs/layouts`,
    src: [
      './src/ejs/**/*.ejs',
      '!./src/ejs/**/_*.ejs'
    ],
    dist: './build',
    watch: './src/ejs/**/*.ejs'
  },
  css: {
    src: [
      './src/css/**/*.css',
      '!./src/css/**/_*.css'
    ],
    dist: './build/assets/css',
    watch: './src/css/**/*.css'
  },
  js: {
    app: './src/js/app.js',
    dist: 'build/assets/js',
    bundle: 'bundle.js',
    watch: './src/js/**/*.js'
  }
};

gulp.task('ejs', () => {
  const opts = {
    frontMatter: {
      property: 'data'
    },
    wrapper: {
      layout: path.ejs.layoutDir,
      data: {
        name: 'hoge',
        layoutDir: path.ejs.layoutDir
      },
      engine: 'ejs',
      frontMatterProp: 'data'
    }
  };

  return gulp.src(path.ejs.src)
    .pipe(plumber())
    .pipe(frontMatter(opts.frontMatter))
    .pipe(wrapper(opts.wrapper))
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(gulp.dest(path.ejs.dist))
    .pipe(stream());
});

gulp.task('postcss', () => {
  const opts = [
    customProperties,
    customMedia,
    Import,
    nested,
    cssnano
  ];

  return gulp.src(path.css.src)
    .pipe(plumber())
    .pipe(postcss(opts))
    .pipe(gulp.dest(path.css.dist));
});

gulp.task('browserify', () => {
  return browserify({
    entries: [`${path.js.app}`]
  })
  .bundle()
  .pipe(sourceStream(`${path.js.bundle}`))
  .pipe(gulp.dest(`${path.js.dist}`));
});

gulp.task('serve', () => {
  return browserSync.init({
    server: './build/',
    open: 'external'
  });
})

gulp.task('watch', () => {
  gulp.watch(`${path.ejs.watch}`, e => runSequence('ejs', () => reload));
  gulp.watch(`${path.css.watch}`, e => runSequence('postcss', () => reload));
  gulp.watch(`${path.js.watch}`, e => runSequence('browserify', () => reload));
});

gulp.task('default', () => {
  runSequence(
    ['ejs', 'postcss', 'browserify'],
    'serve',
    'watch'
  );
})
