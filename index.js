'use strict';

const Module = require('./src/class/Module');
const stream = require('stream');

function forgivingConverter (source) {
    var module, err = null, result;
    try {
        module = new Module(source);
        module.convert();
        result = module.toSource();
    } catch (exception) {
        result = source;
        err = exception;
    }

    return {
        err: err,
        source: result
    };
}

function converter (source) {
    var module = new Module(source);
    module.convert();
    return module.toSource();
}

converter.stream = function () {
    var transform = new stream.Transform({ objectMode: true });

    transform._transform = function (file, encoding, callback) {
        var result, data;
        if (typeof file === 'string') {
            result = forgivingConverter(file);
            return callback(result.err, result.source);
            
        }
        data = file.contents.toString('utf8');
        result = forgivingConverter(data);
        file.contents = new Buffer(converter(result.source));
        callback(result.err, file);
    };

    return transform;
};

module.exports = converter;
