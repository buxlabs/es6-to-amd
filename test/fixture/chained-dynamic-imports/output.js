define(["require"], function (require) {
    "use strict";

    Promise.all([
        new Promise(function (resolve, reject) {
            require(["foo.js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false}) ) }, reject)
        }),
        new Promise(function (resolve, reject) {
            require(["bar.js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
        })
    ]).then(values => {
        console.log(values);
    });

    new Promise(function (resolve, reject) {
        require(["foo.js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
    }).then(() => {
        return new Promise(function (resolve, reject) {
            require(["bar.js"], function(module) { resolve(typeof module !== "object" || ("default" in module) ? {default: module} : Object.defineProperty(module, "default", {value: module, enumerable: false})) }, reject)
        });
    });
});

