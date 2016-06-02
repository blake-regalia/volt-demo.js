/*eslint-env browser*/
/*global ace*/

import $ from 'jquery';

import sparql_handler from './handler-sparql';
import turtle_handler from './handler-turtle';
import volt_handler from './handler-volt';

//
const H_MODE_HANDLERS = {
	sparql: sparql_handler,
	turtle: turtle_handler,
	volt: volt_handler,
};


// 
let y_editor;
let k_handler;

// 
let q_status;
let q_output;
let q_results;
let q_controls;


//
const session_helper = function() {

	//
	const hm_gutter_decorations = new Map();

	//
	return {

		// alias ace Range
		range: ace.require('ace/range').Range,

		// creates interface to change selection range
		line_range(n_row) {
			return {
				start: {
					row: n_row,
					column: 0,
				},
				end: {
					row: n_row,
					column: Infinity,
				},
				get line() {
					return this.start.row;
				},
				set line(n_line) {
					this.start.row = this.end.row = n_line;
				},
			};
		},

		// clears all markers from current session
		clear_markers() {
			for(let i_marker in y_editor.session.getMarkers()) {
				y_editor.session.removeMarker(i_marker);
			}
		},


		//
		set_gutter(i_line, s_class) {
			this.remove_gutter(i_line);
			hm_gutter_decorations.set(i_line, s_class);
			y_editor.session.addGutterDecoration(i_line, s_class);
		},

		//
		remove_gutter(i_line) {
			if(hm_gutter_decorations.has(i_line)) {
				y_editor.session.removeGutterDecoration(i_line, hm_gutter_decorations.get(i_line));
				hm_gutter_decorations.delete(i_line);
			}
		},

		// clears all gutter decoration from current session
		clear_gutter() {
			for(let [i_line, s_class] of hm_gutter_decorations) {
				y_editor.session.removeGutterDecoration(i_line, s_class);
				hm_gutter_decorations.delete(i_line);
			}
		},

		//
		load(s_file_data) {

			// load file data into editor
			y_editor.setValue(s_file_data);

			// clear selection and move cursor to beginning
			y_editor.moveCursorTo(0, 0);
			y_editor.clearSelection();
		},
	};

};


//
$(document).on('click', '.ace_gutter-cell.ready', (d_event) => {

	// compute line this button is bound to
	let n_line = parseInt($(d_event.target).text()) - 1;

	// forward to handler
	k_handler.gutter_click(n_line);
});



$(function() {

	// fetch status div
	q_status = $('#status');

	// fetch output div
	q_output = $('#output');

	// fetch results div
	q_results = $('#results');

	// fetch controls div
	q_controls = $('#controls');


	// load editor
	y_editor = ace.edit('editor');

	// set theme
	y_editor.setTheme('ace/theme/monokai');

	// set options
	y_editor.$blockScrolling = Infinity;

	// fetch editor jquery handle
	var q_editor = $(y_editor.container);

	// fetch editor mode
	let s_mode = q_editor.attr('data-ace-mode');

	// set mode on editor's session
	y_editor.getSession().setMode('ace/mode/'+s_mode);


	// create appropriate mode-editor
	k_handler = new H_MODE_HANDLERS[s_mode]({

		//
		helper: session_helper(),
		editor: y_editor,

		//
		status: q_status,
		output: q_output,
		results: q_results,
	});


	// command key
	q_editor.keydown((d_event) => {

		// enter key w/ cmd
		if(13 === d_event.which && (d_event.metaKey || d_event.ctrlKey)) {

			// forward meta+enter key event to mode-editor
			k_handler.main_enter();
		}
	});
});
