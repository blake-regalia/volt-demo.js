
const util = require('util');
const autoprefixer = require('autoprefixer');

module.exports = function(gulp, $, p_src, p_dest) {

	// styles & modules directory
	let p_styles = p_src+'/src/_styles';
	let p_modules = p_src+'/src/_modules';

	// build stream
	return gulp.src(p_styles+'/**/*.less')

		// // only proceed with files that have changed
		// .pipe($.cached(s_task))

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// begin sourcemaps
		.pipe($.sourcemaps.init())

			// compile less => css
			.pipe($.less({
				paths: [
					p_styles,
					p_modules,
				],
			}))

			// auto-prefix css
			.pipe($.postcss([
				autoprefixer({
					browsers: [
						'last 2 version',
						'> 5%',
						'safari 5',
						'ios 6',
						'android 4',
					],
				})
			]))

		// remove 'src' dir and '_' file prefix from path
		.pipe($.if(this.options.rename, $.rename(this.options.rename)))

		// // minify css
		// .pipe($.if(B_PRODUCTION, $.minifyCss({
		// 	rebase: false,
		// })))

		// sourcemaps
		.pipe($.sourcemaps.write())

		// write to output directory
		.pipe(gulp.dest(p_dest));

		// // browser sync
		// .pipe($.if(browser_sync, browser_sync? browser_sync.stream(): ()=>{}));
};
