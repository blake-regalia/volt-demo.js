
const classer = require('classer').default;
const express = require('express');
const bodyParser = require('body-parser');
const volt = require('volt').default;

/**
* defaults:
**/

// default proxy server port
const N_DEFAULT_PORT = 8081;

/**
* globals:
**/

// module
const local = classer('proxy', (...a_args) => {
	return new proxy(...a_args);
});


/**
* class:
**/
class proxy {

	constructor(h_volt_config, h_proxy_config={}, f_proxy_ready) {

		// shift arguments
		if(2 === arguments.length) {
			f_proxy_ready = h_proxy_config;
			h_proxy_config = {};
		}

		// create volt instance
		let k_volt = volt(h_volt_config);

		// destruct proxy config
		let {
			port: n_proxy_port,
		} = h_proxy_config;

		// prepare express http server
		const app = express();

		// body-parser middleware
		app.use(bodyParser.urlencoded({extended: true}));


		// query service
		app.post('/sparql', (req, res) => {

			// fetch sparql query from request body
			let s_sparql = req.body.query;

			// set cors header
			res.set('Access-Control-Allow-Origin', '*');

			// start timer
			let t_query_started = Date.now();

			// issue query
			k_volt(s_sparql, (z_results) => {

				// stop timer
				let t_query_completed = Date.now();

				// mutate response object
				let h_response = Object.assign(z_results, {

					// compute execution time
					execution_time: t_query_completed - t_query_started,
				});

				// set cors header
				res.set('Access-Control-Allow-Origin', '*');

				// send back results
				res.json(h_response);
				res.end();
			});
		});


		// compile volt source to ttl
		app.post('/compile', (req, res) => {

			// compile the source
			let h_result = volt.compile({
				code: req.body.volt,
			});

			// send back results
			res.json(h_result);
			res.end();
		});


		// interface
		app.use('/', express.static(__dirname+'/../webapp'));


		// open port & start server
		let y_server = app.listen(n_proxy_port || N_DEFAULT_PORT, () => {

			// fetch server address
			let h_address = y_server.address();

			// log to console
			local.good(`Proxy running at http://${h_address.address}:${h_address.port}`);

			// ready callback
			if(f_proxy_ready) f_proxy_ready();
		});
	}
}

module.exports = local;
