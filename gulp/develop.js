
// module
export default (gulp, $) => {

	// make develop task
	return function develop(s_dir, s_task, p_src) {

		// make dependents tasks
		let a_deps = this.args.map(s => this.task(s));

		// register develop task
		gulp.task(s_task, a_deps, () => {
			$.util.log($.util.colors.magenta(`watching ${p_src}/**/*'`));
			gulp.watch(p_src+'/**/*', a_deps);
		});
	};
};
