import Bar from 'Foo';

import('foo.js').then(function(foo) {
	console.log(foo);
});

import('bar' + '.js').then(function(bar) {
	console.log(bar.default);
});

var dynamic = 'foobar';
async function bar() {
	var foo = await import(dynamic);
	console.log(foo);
}
