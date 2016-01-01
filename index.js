'use strict';

var http = require('http');

module.exports = function (host, port, user, pass) {

	var options = {
		'host'    : host,
		'port'    : port,
		'path'    : '/db/data/transaction/commit',
		'method'  : 'POST',
		'headers' : {
			'Content-Type'   : 'application/json',
			'Content-Length' : 0,
			'Authorization'  : 'Basic ' + new Buffer(user + ':' + pass).toString('base64')
		}
	};

	var request = function (data, callback) {

		var payload = JSON.stringify(data);

		options.headers['Content-Length'] = Buffer.byteLength(payload);

		var request = http.request(options, function (response) {

			var body = '';

			response.on('data', function (data) {
				body += data;
			});

			response.on('end', function () {
				callback(JSON.parse(body));
			});

		});

		request.write(payload);
		request.end();
	};

	var parse = function (result) {

		return result.data.map(function (data) {

			var row = {};

			data.row.forEach(function (record, index) {
				row[result.columns[index]] = record;
			});

			return row;
		});
	};

	var query = function (query, params, callback) {

		var statements = [ {
			'statement'  : query,
			'parameters' : params
		} ];

		var payload = {
			'statements' : statements
		};

		request(payload, function (body) {

			if (body.errors.length > 0) {
				callback(body.errors);
			} else {
				callback(null, body.results.map(parse).pop());
			}
		});
	};

	var batch = function (queries, params, callback) {

		var statements = [];

		queries.forEach(function (query, index) {
			statements.push({
				'statement'  : query,
				'parameters' : params[index]
			});
		});

		var payload = {
			'statements' : statements
		};

		request(payload, function (body) {

			if (body.errors.length > 0) {
				callback(body.errors);
			} else {
				callback(null, body.results.map(parse));
			}
		});
	};

	return {
		'query' : query,
		'batch' : batch
	}

};