/*eslint-env browser*/
import $ from 'jquery';
import L from 'leaflet';

import H_CONFIG from './config.js';


// init leaflet
(() => {
	let p_icons = L.Icon.Default.imagePath = '/source/leaflet-images';

	// size map
	var h_size = {
		sml: '12',
		med: '18',
		lrg: '24',
	};

	// helper function
	var icon = function(s_name, a_dim, a_anchor) {
		if(!a_anchor) a_anchor = [Math.floor(a_dim[0]*0.5), Math.floor(a_dim[1]*0.5)];
		return (function(s_size) {
			let n_size = (s_size && h_size[s_size]) || '24';
			var p_icon = p_icons+this.name+'-'+n_size;
			return new L.Icon({
				iconUrl: p_icon+'.png',
				iconRetinaUrl: p_icon+'@2x.png',
				iconSize: this.dim,
				iconAnchor: this.anchor,
				color: '#ff0',
			});
		}).bind({name: s_name, dim: a_dim, anchor: a_anchor});
	};

	// icon table
	L.Icons = {
		Cross: icon('cross', [11, 11]),
		Tick: function(s_color) {
			return new L.DivIcon({
				className: 'Ldi-cross med',
				html: '<div style="color:'+s_color+';">&#735;</div>',
			});
		},
		Dot: function(s_color) {
			return new L.DivIcon({
				className: 'Ldi-dot med',
				html: '<div style="color:'+s_color+';">&#8226;</div>',
				popupAnchor: [0, -3],
			});
		},
	};
})();



//
const R_QUERY = /^\s*(ask|select|describe)/i;

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

	let q_map = $('#map');
	let y_map = L.map(q_map.get(0));

	$('#clear').click(() => {
		$.ajax({
			method: 'POST',
			url: 'http://localhost:3060/dbpedia/update',
			data: {
				update: 'clear graph <graph://output>',
			},
		});
	});

	//
	let h_extra = (() => {
		let s_extra = q_editor.attr('data-extra');
		if(s_extra) return JSON.parse(atob(s_extra));
		return {};
	})();

	// finds all lines deserving execution button
	const insert_block_execution_buttons = (i_except=-1) => {

		// each line in code
		y_editor.getValue().split('\n').forEach((s_line, i_line) => {

			// line matches exepcted beginning of query
			if(R_QUERY.test(s_line) && i_line !== i_except) {

				// set button here
				k_helper.set_gutter(i_line, 'ready');
			}
		});
	};


	// updates all execute buttons
	const update_run_buttons = () => {

		// start by cleaning the gutter
		k_helper.clear_gutter();

		// insert buttons in gutter
		insert_block_execution_buttons();
	};

	//
	const render_map = (a_bindings) => {
		q_map.show();

		y_map.eachLayer((y_layer) => {
			y_map.removeLayer(y_layer);
		});

		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			maxNativeZoom: 19,
			maxZoom: 25,
			detectRetina: true,
		}).addTo(y_map);

		// find geom column from first row
		let s_geo_column = '';
		for(let s_column in a_bindings[0]) {
			if('http://www.openlinksw.com/schemas/virtrdf#Geometry' === a_bindings[0][s_column].datatype) {
				s_geo_column = s_column;
			}
		}

		// create markers layer
		let y_markers = L.featureGroup();

		// each row
		a_bindings.forEach((h_row) => {
			let h_geo = h_row[s_geo_column];
			let [, s_wkt] = /^POINT\((.+)\)$/.exec(h_geo.value);
			let [s_lng, s_lat] = s_wkt.split(/ /);
			L.marker([parseFloat(s_lat), parseFloat(s_lng)], {
				icon: L.Icons.Tick('#000'),
			}).addTo(y_markers);
		});

		y_markers.addTo(y_map);
		y_map.fitBounds(y_markers.getBounds());
	};


	// 
	const display_results = (z_results) => {

		// clear previous info
		q_output.removeClass().text('');

		// clear previous results
		q_results.removeClass().html('');

		if(z_results.hasOwnProperty('boolean')) {
			q_output.text(z_results.boolean+'').addClass('boolean');
			q_map.hide();
		}
		else if(z_results.hasOwnProperty('results')) {
			let b_geometry_column = false;

			// ref head & bindings
			let a_fields = z_results.head.vars;
			let a_bindings = z_results.results.bindings;

			// output text
			q_output.text(`${a_bindings.length} results`).addClass('');

			// build table header using known fields
			let g_table = ''
				+'<div class="header"><div class="fields">'
					+a_fields.map((s_var) => {
						return `<div class="field">${s_var}</div>`;
					}).join('')
				+'</div></div><div class="body">';

			//
			a_bindings.forEach((h_row) => {

				// build table string by string
				g_table += ''
					+'<div class="row">'
						// each field in this row
						+a_fields.map((s_field) => {
							let h_field = h_row[s_field];
							if('http://www.openlinksw.com/schemas/virtrdf#Geometry' === h_field.datatype) {
								b_geometry_column = true;
							}

							//
							return `
								<div class="cell">
									<span class="val"
										data-type="${h_field.type}"
										data-datatype="${h_field.datatype || ''}">
										${h_field.short || h_field.value}
									</span>
								</div>`;
						}).join('')
					+'</div>';
			});

			//
			q_results.html(g_table+'</div>');

			//
			if(b_geometry_column) {
				render_map(a_bindings);
			}
			else {
				q_map.hide();
			}
		}
	};


	//
	const submit_query = (s_sparql, i_query_line) => {

		// execute sparql query
		$.ajax({
			method: 'POST',
			url: H_CONFIG.hosts.proxy_url+'/sparql',
			data: {
				query: s_sparql,
			},

			// 
			success: (h_response) => {

				// unlock editor
				y_editor.setReadOnly(false);

				// remove class from status
				q_status.removeClass();

				// error
				if(h_response.error) {

					// set failed icon
					k_helper.set_gutter(i_query_line, 'fail');

					//
					q_status
						.text('Query encountered an error while executing')
						.addClass('error');

					//
					q_output
						.text(h_response.error)
						.addClass('error');
				}
				// success!
				else {

					// set success icon
					k_helper.set_gutter(i_query_line, 'okay');

					// output time it took
					q_status
						.text('Query took '+h_response.execution_time+'ms to execute')
						.addClass('stable');

					// display results
					display_results(h_response);
				}

				// add all other decorations (except this line)
				insert_block_execution_buttons(i_query_line);
			},

			// 
			error: (d_xhr, s_status, s_http_err) => {

				// not the query's fault
				k_helper.set_gutter(i_query_line, 'ready');

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
	const execute_query_block = (n_line) => {

		// clear gutters
		k_helper.clear_gutter();

		// clear markers
		k_helper.clear_markers();

		// lock editor
		y_editor.setReadOnly(true);

		// prepare to store line range
		let h_line;

		// find beginning of query
		for(h_line = k_helper.line_range(n_line); h_line.line > 0; h_line.line -= 1) {

			// found block-end
			if(/^\s*#\-\-\-/.test(y_editor.session.getTextRange(h_line))) {
				h_line.line += 1;
				break;
			}
		}

		// set start line
		let n_row_start = h_line.line;

		// count number of lines in editor
		let n_lines = y_editor.getValue().split('\n').length;

		// find end of query
		for(h_line = k_helper.line_range(n_line); h_line.line < n_lines; h_line.line += 1) {

			// found block-end
			if(/^\s*#\-\-\-/.test(y_editor.session.getTextRange(h_line))) {
				break;
			}
		}

		// set end line
		let n_row_end = h_line.line;

		// extract query from text range
		let s_query = y_editor.session.getTextRange(new k_helper.range(n_row_start, 0, n_row_end, 0));

		// extract prefixes from top
		let s_prefixes = y_editor.getValue().replace(/^([^]*?)(#---|select|ask|describe|update)[^]*$/, '$1');

		// build enitre sparql string
		let s_sparql = s_prefixes+'\n'+s_query;

		// add marker to indicate this block was executed
		y_editor.getSession().addMarker(
			new k_helper.range(n_row_start, 0, n_row_end-1, 0),
			'execute-substr',
			'fullLine'
		);

		// prepare to find line with current query
		let i_query_line;

		// set busy icon on this query gutter
		let s_code = y_editor.getValue().split('\n');
		for(let i_line=n_row_start; i_line<=n_row_end; i_line+=1) {
			if(R_QUERY.test(s_code[i_line])) {
				k_helper.set_gutter(i_line, 'busy');
				i_query_line = i_line;
				break;
			}
		}

		// update console
		q_status
			.removeClass()
			.text('Executing query...');

		//
		q_output.addClass('dim');
		q_results.addClass('dim');

		// submit query
		submit_query(s_sparql, i_query_line);
	};



	// anytime something changes, clear markers and update buttons
	y_editor.session.on('change', () => {
		k_helper.clear_markers();
		update_run_buttons();
	});


	// request file data
	if(h_extra.file) {
		$.ajax({
			url: '/source/'+h_extra.file,
			success(s_file_data) {
				k_helper.load(s_file_data);
			},
		});
	}


	// reload execute
	if(location.hash) {
		let n_hash_line = parseInt(location.hash.substr(1)) - 1;
		setTimeout(() => {
			execute_query_block(n_hash_line);
		}, 200);
	}


	// interface
	return {

		// handle gutter click event
		gutter_click(n_line) {
			execute_query_block(n_line);
		},


		// handle meta+enter key event on main area
		main_enter() {

			// 
			let n_line = y_editor.getSelectionRange();

			// ref selection
			let k_selection = y_editor.getSelection();

			// no selection
			if(k_selection.isEmpty()) {

				//
				execute_query_block(n_line.start.row);
			}
			// things are selected
			else {

			}
		},
	};
};


export default local;
