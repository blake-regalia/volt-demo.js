

import $ from 'jquery';
import H_CONFIG from './config.js';

//
const local = function(h_init) {

	// destruct initializer
	let {
		editor: y_editor,
	} = h_init;

	// interface
	return {

		// handle meta+enter key event on main area
		main_enter() {

			// lock editor
			y_editor.setReadOnly(true);

			// get code from editor
			let s_source = y_editor.getValue();

			// submit to compiler
			$.ajax({
				url: H_CONFIG.hosts.proxy_url+'/compile',
				method: 'POST',
				data: {
					volt: s_source,
				},
			});
		},
	};
};


export default local;
