define(["require"], function (require) {
    "use strict";

    Promise.all([
        new Promise(function (resolve) {
            require(["foo.js"], resolve)
        }),
        new Promise(function (resolve) {
            require(["bar.js"], resolve)
        })
    ]).then(values => {
        console.log(values);
    });

    new Promise(function (resolve) {
        require(["foo.js"], resolve)
    }).then(() => {
        return new Promise(function (resolve) {
            require(["bar.js"], resolve)
        });
    });
});

