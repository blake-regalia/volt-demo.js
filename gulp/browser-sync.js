
import path from 'path';
import browser_sync_lib from 'browser-sync';

const browser_sync = browser_sync_lib.create();

// module
export default (gulp, $, config) => {

	// // destruct config
	let {
		watch: h_watch,
	} = config;

	// make task
	return function(s_dir, s_task, p_src, p_dest) {

		// reigster dependency-delegator tasks
		let a_sync_tasks = this.args.map((s_arg) => {

			// register sync task
			let s_sync_task = this.task(`sync-${s_arg}`);
			gulp.task(s_sync_task, [this.task(s_arg)], () => {

				// reload browser on changes
				setImmediate(() => {
					browser_sync.reload();
				});
			});

			// 
			return s_sync_task;
		});

		// register browser sync task
		gulp.task(s_task, a_sync_tasks, (cb) => {

			// watch targets
			let b_watching = this.args.every((s_arg) => {
				let s_watch = h_watch[s_arg] || '**/*';
				gulp.watch(path.join(p_src, s_watch), [this.task(`sync-${s_arg}`)]);
				return true;
			});

			//
			if(b_watching) {

				//
				browser_sync.init({
					// port: config.port || 3000,
					// server: {
					// 	baseDir: p_dest,
					// },
					proxy: 'http://localhost:8081',
					browser: 'google chrome',
					port: 3000,
				});
			}

			// $.util.log('yeap: '+b_watching);
			// cb();
		});
	};
};
