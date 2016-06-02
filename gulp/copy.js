
// module
export default (gulp, $, config) => {

	// destruct config
	let {
		rules: h_rules,
	} = config;

	// make task
	return function(s_dir, s_task, p_src, p_dest) {

		//
		let h_options = h_rules[s_task] || {};

		// register task
		gulp.task(s_task, () => {

			$.util.log(p_src+'/'+this.args[0]);

			//
			gulp.src(p_src+'/'+this.args[0])

				// 
				.pipe($.rename((...a_args) => {
					$.util.log(a_args[0]);
					if(h_options.rename) h_options.rename(...a_args);
				}))

				// 
				.pipe(gulp.dest(p_dest));
		});
	};
};
