define(["require", "Foo"], function (require, Bar) {
    "use strict";
    new Promise(function (resolve, reject) {
        require(["foo.js"], resolve, reject)
    }).then(function(foo) {
        console.log(foo);
    });
    new Promise(function (resolve, reject) {
        require(["bar" + ".js"], resolve, reject)
    }).then(function (bar) {
        console.log(bar);
    });
    var dynamic = "foobar";
    async function bar() {
        var foo = await new Promise(function (resolve, reject) {
            require([dynamic], resolve, reject)
        });
        console.log(foo);
    }
});
