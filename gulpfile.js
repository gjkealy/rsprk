var
	gulp = require('gulp'),
	imagemin = require('gulp-imagemin'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss')
	autoprefixer = require('autoprefixer'),
	flexbugs = require('postcss-flexbugs-fixes'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	order = require('gulp-order'),
	nunjucks = require('gulp-nunjucks-render'),
	data = require('gulp-data'),

	path = {
		assets: 'assets/',
		dist: 'dist/'
	},

	globs = {
		images: path.assets + 'images/**/*',
		scripts: path.assets + 'scripts/**/*',
		styles: path.assets + 'styles/**/*',
		pages: 'pages/**/*'
	},

	scriptsToImport = {
		jQuery: 'node_modules/jquery/dist/jquery.js',
		tether: 'node_modules/tether/dist/js/tether.js',
		bootstrap: 'node_modules/bootstrap/js/dist/*'
	},

	orderedScripts = [
		'jquery.js',
		'tether.js',
		'alert.js',
		'button.js',
		'carousel.js',
		'collapse.js',
		'dropdown.js',
		'modal.js',
		'scrollspy.js',
		'tab.js',
		'tooltip.js',
		'popover.js'
	]
;

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, [path.dist]));

// ### Import Scripts
//
gulp.task('import-scripts', function() {
	return gulp.src([
		scriptsToImport.jQuery,
		scriptsToImport.tether,
		scriptsToImport.bootstrap
	])
	.pipe(gulp.dest(path.assets + 'scripts/'));
});

// ### Scripts
// `gulp scripts` - Runs JSHint then compiles, combines, and optimizes
gulp.task('scripts', function() {
	return gulp.src(globs.scripts)
		.pipe(order(orderedScripts))
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.dist + 'scripts/'));
});

// ### Styles
// `gulp styles` - Compiles, combines, and optimizes Bower CSS and project CSS.
gulp.task('styles', function() {
	var postCssPlugins = [
		autoprefixer({
			browsers: [
				'Chrome >= 35',
				'Firefox >= 38',
				'Edge >= 12',
				'Explorer >= 10',
				'iOS >= 8',
        'Safari >= 8',
        'Android 2.3',
        'Android >= 4',
        'Opera >= 12'
      ]
		}),
		flexbugs
	];
	return gulp.src(globs.styles)
		.pipe(sass({
			outputStyle: 'nested',
			precision: 10,
			errLogConsole: true
		}))
		.pipe(postcss(postCssPlugins))
		.pipe(gulp.dest(path.dist + 'styles/'));
});

// ### Images
// `gulp images` - Run lossless compression on all the images.
gulp.task('images', function() {
  return gulp.src(globs.images)
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.gifsicle({interlaced: true}),
      imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
    ]))
    .pipe(gulp.dest(path.dist + 'images'));
});

// ### Pages
// `gulp nunjucks`
gulp.task('pages', function() {
	return gulp.src(globs.pages)
		.pipe(data(function() {
      return require('./data.json')
    }))
		.pipe(nunjucks({
			path: ['templates/']
		}))
		.pipe(gulp.dest(''));
});

gulp.task('build', ['images', 'pages', 'styles', 'scripts']);

// ### Watching for changes
//
gulp.task('watch', function() {
	gulp.watch(globs.images, ['images']);
	gulp.watch(globs.scripts, ['scripts']);
	gulp.watch(globs.styles, ['styles']);
	gulp.watch([globs.pages, 'templates/**/*'], ['pages']);
});