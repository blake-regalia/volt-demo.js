
// native imports
import path from 'path';

// gulp
import gulp from 'gulp';

// load gulp plugins
import plugins from 'gulp-load-plugins';
const $ = plugins({
	pattern: ['gulp-*', 'vinyl-*'],  // load gulp and vinyl modules
	replaceString: /^(?:gulp|vinyl)(-|\.)/,
});

// gulp module-level config
import config from './config.module.js';

// gulp user-level config
let user_config = {};
try { user_config = require('./config.user.js').default; } catch(e) {}

// gulp task makers
import tasks from './gulp/load-tasks';

// specify how config targets map to tasks
tasks(gulp, $, Object.assign({}, user_config, config)).load({

	// transpiling javascript source to dist
	js: ['transpile', 'develop:transpile'],

	// webapp development
	bundle: [
		'less',
		'jade',
		'browserify',
		'copy:src/source/**/*',
		'browser-sync:less:jade:browserify:copy',
		'develop:less:jade:browserify:copy',
	],
});

// // default
// gulp.task('default', ['build']);
