var url   = process.env.NEO4J_URL || 'http://neo4j:neo4j@localhost:7474';
var graph = require('../')(url);

describe('Query', function () {

	it('should create', function (done) {
		graph.query('CREATE (x:JobTestLabel { salary: {salary} }) RETURN x', { 'salary' : 1234 }, done);
	});

	it('should fetch', function (done) {
		graph.query('MATCH (x:JobTestLabel) RETURN x', done);
	});

	it('should delete', function (done) {
		graph.query('MATCH (x:JobTestLabel { salary: {salary} }) DETACH DELETE x', { 'salary' : 1234 }, done);
	});

});

describe('Batch', function () {

	it('should execute', function (done) {
		graph.batch(['MATCH (n) RETURN n', 'MATCH (r:JobTestLabel) RETURN r'], [], done);
	});

});