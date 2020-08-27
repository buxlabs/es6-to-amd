define(["require", "Foo"], function (require, Bar) {
    "use strict";
    new Promise(function (resolve, reject) {
        require(["foo.js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
    }).then(function(foo) {
        console.log(foo);
    });
    new Promise(function (resolve, reject) {
        require(["bar" + ".js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
    }).then(function (bar) {
        console.log(bar.default);
    });
    var dynamic = "foobar";
    async function bar() {
        var foo = await new Promise(function (resolve, reject) {
            require([dynamic], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module } : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
        });
        console.log(foo);
    }
});
