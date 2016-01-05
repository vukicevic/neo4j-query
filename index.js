'use strict';

var http = require('http');
var url  = require('url');

module.exports = function (uri, user, pass) {

	var parts   = url.parse(uri);
	var auth    = parts.auth || user + ':' + pass;

	var options = {
		'hostname' : parts.hostname,
		'port'     : parts.port,
		'protocol' : parts.protocol,
		'auth'     : auth,
		'path'     : '/db/data/transaction/commit',
		'method'   : 'POST',
		'headers'  : {
			'Content-Type'   : 'application/json',
			'Content-Length' : 0
		}
	};

	var request = function (payload, callback) {

		var data = JSON.stringify(payload);

		options.headers['Content-Length'] = Buffer.byteLength(data);

		var request = http.request(options, function (response) {

			var body = '';

			response.on('data', function (data) {
				body += data;
			});

			response.on('end', function () {
				callback(null, JSON.parse(body));
			});

		});

		request.on('error', callback);
		request.write(data);
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

	var query = function (query, param, callback) {

		if (typeof param === 'function') {
			callback = param;
			param    = undefined;
		}

		batch([query], [param], function (error, result) {

			if (Array.isArray(error)) {
				error = error.pop();
			}

			if (Array.isArray(result)) {
				result = result.pop();
			}

			callback(error, result);
		});
	};

	var batch = function (queries, params, callback) {

		var payload = {
			'statements' : []
		};

		queries.forEach(function (query, index) {
			payload.statements.push({
				'statement'  : query,
				'parameters' : params[index]
			});
		});

		request(payload, function (error, response) {

			if (error) {
				return callback(error);
			}

			if (response.errors.length > 0) {
				return callback(response.errors);
			}

			callback(null, response.results.map(parse));
		});
	};

	return {
		'query' : query,
		'batch' : batch
	};

};