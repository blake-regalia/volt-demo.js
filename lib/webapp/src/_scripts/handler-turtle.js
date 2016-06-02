

import $ from 'jquery';
import H_CONFIG from './config.js';

//
const local = function(h_init) {

	//
	let k_helper = h_init.helper;
	let y_editor = h_init.editor;

	//
	let q_editor = $(y_editor.container);
	let q_status = h_init.status;
	let q_output = h_init.output;
	let q_results = h_init.results;
	let q_controls = h_init.controls;

	//
	const display_results = (h_results) => {
		
	};


	//
	const submit_replace = (s_turtle) => {

		// execute sparql query
		$.ajax({
			url: H_CONFIG.hosts.proxy_url+'/graph',
			method: 'POST',
			data: {
				turtle: s_turtle,
			},

			// 
			success: (h_response) => {

				// unlock editor
				y_editor.setReadOnly(false);

				// remove class from status
				q_status.removeClass();

				// error
				if(h_response.error) {

					//
					q_status
						.text('Encountered an error while replacing graph...')
						.addClass('error');

					//
					q_output
						.text(h_response.error)
						.addClass('error');
				}
				// success!
				else {

					// output time it took
					q_status
						.text('Successfully replaced graph: <'+h_response.graph+'>')
						.addClass('stable');

					// update output
					let s_json = JSON.stringify(h_response.output, null, '    ');
					q_output
						.removeClass()
						.text(s_json)
						.addClass('normal');

					// // display results
					// display_results(h_response.results);
				}
			},

			// 
			error: (d_xhr, s_status, s_http_err) => {

				// http error
				if(s_http_err) {
					q_status
						.text('HTTP Error: '+s_http_err)
						.addClass('error');
				}
				else {
					if(0 === d_xhr.readyState) {
						q_status
							.text('Network Error: Connection refused')
							.addClass('error');
					}
					else {
						q_status
							.text('XHR Error: '+s_status)
							.addClass('error');
					}
				}
			},
		});
	};


	//
	const execute_all = () => {

		// clear gutters
		k_helper.clear_gutter();

		// lock editor
		y_editor.setReadOnly(true);

		// update console
		q_status
			.removeClass()
			.text('Replacing graph...');

		//
		q_output.addClass('dim');
		q_results.addClass('dim');

		// get code from editor
		let s_turtle = y_editor.getValue();

		// submit update
		submit_replace(s_turtle);
	};


	// request file data
	$.ajax({
		method: 'GET',
		url: H_CONFIG.hosts.proxy_url+'/graph',
		data: {
			graph: 'graph://'+q_editor.attr('data-file').replace(/\.ttl$/, ''),
		},
		success(h_response) {

			// error
			if(h_response.error) {

			}
			// success!
			else {

				// ref turtle
				let s_turtle = h_response.turtle;

				// reformat
				s_turtle = s_turtle
					// .replace(/\n(\s*)([\w,]*:[\w,]+)\s*\[([^\n]+)/g, (s_full, s_indent, s_subject, s_bnode) => {
					// 	return '\n'+s_indent+s_subject+' [\n'+s_indent+'\t'+s_bnode;
					// })
					.replace(/\n([ \t]+)([\w,]*:[\w,]*)/g, (s_full, s_tabs, s_pred) => {
						return '\n'+s_tabs.replace(/^(\t|    )/, '')+s_pred;
					})
					.replace(/\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([\w,]*:[\w,]*)[ \t]+([^\;\.]+)/g, (s_full, s_indent, s_subject, s_predicate, s_obj) => {
						return '\n'+s_indent+s_subject+'\n'+s_indent+'\t'+s_predicate+' '+s_obj;
					});
					// .replace(/\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([^\n]+)\n([ \t]+)([\w,]*:[\w,]*)/g, (s_full, s_prev_tabs, s_prev_predicate, s_prev_object, s_tabs, s_predicate) => {
					// 	// return 'YES';
					// 	return '\n'+s_prev_tabs+s_prev_predicate+' '+s_prev_object+'\n'+s_prev_tabs+s_predicate;
					// })
					// .replace(/\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([^\n]+)\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([^\n]+)\n([ \t]+)([\w,]*:[\w,]*)/g, (s_full, s_tabs0, s_pred0, s_obj0, s_tabs1, s_pred1, s_obj1, s_tabs2, s_pred2) => {
					// 	return ''
					// 		+'\n'+s_tabs0+s_pred0+' '+s_obj0
					// 		+'\n'+s_tabs1+s_pred1+' '+s_obj1
					// 		+'\n'+s_tabs1+s_pred2;
					// })
					// .replace(/\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([^\n]+)\n([ \t]*)([\w,]*:[\w,]*)[ \t]+([^\n]+)\n([ \t]+)([\w,]*:[\w,]*)/g, (s_full, s_tabs0, s_pred0, s_obj0, s_tabs1, s_pred1, s_obj1, s_tabs2, s_pred2) => {
					// 	return ''
					// 		+'\n'+s_tabs0+s_pred0+' '+s_obj0
					// 		+'\n'+s_tabs1+s_pred1+' '+s_obj1
					// 		+'\n'+s_tabs1+s_pred2;
					// })
					// .replace(/\n(\t+)([^\n]+)\n(\t+)([\w,]*:[\w,]*)/g, (s_full, s_prev_tabs, s_prev_line, s_tabs, s_predicate) => {
					// 	return '\n'+s_prev_tabs+s_prev_line+'\n!'+s_predicate;
					// });
					// .replace(/\n(\t+)([^\n]+)\n([ \t]+)([\w,]*:[\w,]+)/g, (s_full, s_prev_tabs, s_prev_line, s_tabs, s_predicate) => {
					// 	return '\n'+s_prev_tabs+s_prev_line+'\n'+s_prev_tabs+s_predicate;
					// })
					// .replace(/\n(\t+)([^\n]+)\n([ \t]+)([\w,]*:[\w,]+)/g, (s_full, s_prev_tabs, s_prev_line, s_tabs, s_predicate) => {
					// 	return '\n'+s_prev_tabs+s_prev_line+'\n'+s_prev_tabs+s_predicate;
					// });

				// load turtle into code
				k_helper.load(s_turtle);
			}
		},
	});



	// interface
	return {

		// handle meta+enter key event on main area
		main_enter() {
			execute_all();
		},
	};
};


export default local;
