import path from 'path';

// import through from 'through2';
// import globby from 'globby';
// import event_stream from 'event-stream';

import babelify from 'babelify';
import browserify from 'browserify';
// import watchify from 'watchify';
// import envify from 'envify';

// module
export default (gulp, $, config) => {

	// destruct config
	let {
		watch: h_watch,
	} = config;

	// make task
	return function mk_browserify(s_dir, s_task, p_src, p_dest) {

		// register task
		gulp.task(s_task, () => {

			// load source files
			return gulp.src(path.join(p_src, h_watch.browserify), {read: false})

				// transform file objects with gulp-tap
				.pipe($.tap((h_file) => {

					// $.util.log($.util.colors.green(h_file.path));

					h_file.contents = browserify({
						entries: [h_file.path],
						debug: true,
						transform: [
							// transpile down to es5
							babelify.configure({
								presets: ['es2015'],
							}),
							// envify, // Sets NODE_ENV for optimization of npm packages
						],
						// cache: {},
						// packageCache: {},
						// plugin: [watchify],
					}).bundle();
				}))

				//
				.pipe($.cached(s_task))

				// transform streaming contents into buffer contents
				.pipe($.buffer())

				// // rename
				.pipe($.rename((...a_args) => {
					$.util.log(a_args[0]);
					if(this.options.rename) this.options.rename(...a_args);
				}))

				.pipe($.debug())

				// write
				.pipe(gulp.dest(p_dest));

		});
	};
};
