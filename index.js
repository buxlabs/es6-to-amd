'use strict';

const Module = require('./src/class/Module');

module.exports = function (source) {
    var module = new Module(source);
    module.convert();
    return module.toSource();
};
