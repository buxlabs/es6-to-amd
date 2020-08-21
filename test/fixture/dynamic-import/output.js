define(["require", "Foo"], function (require, Bar) {
    "use strict";
    new Promise(function (resolve) {
        require(["foo.js"], resolve)
    }).then(function(foo) {
        console.log(foo);
    });
    new Promise(function (resolve) {
        require(["bar" + ".js"], resolve)
    }).then(function (bar) {
        console.log(bar);
    });
    var dynamic = "foobar";
    async function bar() {
        var foo = await new Promise(function (resolve) {
            require([dynamic], resolve)
        });
        console.log(foo);
    }
});
