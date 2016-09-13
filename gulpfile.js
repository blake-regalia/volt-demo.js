//
const path = require('path');

// gulp & tasker
const gulp = require('gulp');
const soda = require('gulp-soda');

// gulp user-level config
let h_user_config = {};
try { h_user_config = require('./config.user.js'); }
catch(e) {}

// 
soda(gulp, {
	// pass user config
	config: h_user_config,

	// build targets
	domain: {
		server: 'proxy',
		webapp: 'bundle',
	},

	// map types to recipe lists
	range: {

		// transpiling javascript
		proxy: [
			'transpile',
			'reload-proxy: transpile',
			'develop: transpile',
		],

		// webapp development
		bundle: [
			'[all]: less jade browserify copy',
			'less',
			'jade',
			'browserify',
			'copy',
			'browser-sync: all',
			'develop: all',
		],
	},

	// task options
	options: {
		less: {
			watch: '**/*.less',
			rename: h => h.dirname = './styles',
		},
		jade: {
			watch: '**/*.jade',
			rename: h => h.dirname = h.dirname.replace(/^src/, '.'),
		},
		browserify: {
			watch: '**/*.js',
			src: 'src/_scripts',
			rename: h => h.dirname = path.join('scripts', h.dirname),
		},
		'copy-webapp': {
			src: 'src/source',
			rename: h => h.dirname = 'source',
		},
	},

	//
	aliases: {
		serve: ['reload-proxy', 'develop-webapp', 'browser-sync'],
	},
});
