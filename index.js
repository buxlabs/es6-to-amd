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
        if (typeof file === 'string') { return callback(null, converter(file)); }
        var data = file.contents.toString('utf8');
        file.contents = new Buffer(converter(data));
        callback(null, file);
    };

    return transform;
}

module.exports = converter;
