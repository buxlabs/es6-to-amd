'use strict';

const Module = require('./src/class/Module');
const stream = require('stream');

function converter (source) {
    var module = new Module(source);
    module.convert();
    return module.toSource();
}

converter.stream = function () {
    var transform = new stream.Transform({ objectMode: true });

    transform._transform = function (file, encoding, callback) {
        callback(null, converter(file));
    };

    return transform;
}

module.exports = converter;
