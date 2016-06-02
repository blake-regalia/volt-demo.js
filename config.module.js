import path from 'path';

export default {
	src: 'lib',
	dest: 'dist',
	targets: {
		server: 'js',
		webapp: 'bundle',
	},

	watch: {
		less: '**/*.less',
		jade: '**/*.jade',
		browserify: 'src/_scripts/**/*.js',
	},

	rules: {
		'jade-webapp': {
			rename: (h_path) => {
				h_path.dirname = h_path.dirname.replace(/^src/, '.');
			},
		},
		'browserify-webapp': {
			rename: (h_path) => {
				h_path.dirname = path.join('scripts', h_path.dirname);
				// h_path.dirname = h_path.dirname.replace(/^lib\/webapp\/src\/_scripts/, './scripts');
			},
		},
		'copy-webapp': {
			rename: (h_path) => {
				h_path.dirname = 'source';
			},
		},
	},

	aliases: {
		serve: ['develop', 'browser-sync'],
	},
};
