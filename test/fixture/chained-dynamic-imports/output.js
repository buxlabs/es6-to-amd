define(["require"], function (require) {
    "use strict";

    Promise.all([
        new Promise(function (resolve, reject) {
            require(["foo.js"], resolve, reject)
        }),
        new Promise(function (resolve, reject) {
            require(["bar.js"], resolve, reject)
        })
    ]).then(values => {
        console.log(values);
    });

    new Promise(function (resolve, reject) {
        require(["foo.js"], resolve, reject)
    }).then(() => {
        return new Promise(function (resolve, reject) {
            require(["bar.js"], resolve, reject)
        });
    });
});

