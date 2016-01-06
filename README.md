# neo4j-query [![Build Status](https://semaphoreci.com/api/v1/projects/3bfeb4bc-774d-4298-8fe1-7e22f6e24bb5/651323/badge.svg)](https://semaphoreci.com/vukicevic/neo4j-query)

A simple wrapper for the Neo4J transactional endpoint. Useful for executing Cypher queries from node.

It has no dependencies and is a very light at ~100 LoC. Useful if you only need to execute cypher queries.

## Load

```javascript
var graph = require('neo4j-query')('http://test:test@localhost:7474');
```
or

```javascript
var graph = require('neo4j-query')('http://localhost:7474', 'test', 'test');
```

## Query

Execute a cypher query. Provide params if defined in query.

###graph.query(query, [param], callback);

The callback has two parameters, error and result.

Result is always an array (of rows/matches).

Each row is an object with keys corresponding to the name in the query.

```javascript
graph.query('MATCH (abc) RETURN abc', function (error, result) {
	result.forEach(function (row) {
		console.log(row.abc)
	});
});
```

```javascript
graph.query('MATCH (user:User { name: {name} }) RETURN user', { 'name' : 'Ben' }, function (error, result) {
	result.forEach(function (row) {
		console.log(row.user);
	});
});
```

## Batch

Batch executes multiple queries in a single transaction.

###graph.batch(queries, params, callback)

queries is an array of strings (cypher queries). 

params is an array of parameter objects (empty array and empty objects allowed). 

The callback is similar to the query callback, except the result is an array of result arrays, each entry corresponding to an executed query in the order they were defined.

```javascript
var queries = [
	'CREATE (x:User {props}) RETURN x',
	'CREATE (x:Job { salary: {salary} }) RETURN x'
];

var params = [
	{ 'props'  : { 'name' : 'Ben' } },
	{ 'salary' : 1234 }
];

graph.batch(queries, params, function (error, results) {
	results.forEach(function (result) {
		result.forEach(function (row) {
			console.log(row.x);
		});
	});
});
```
