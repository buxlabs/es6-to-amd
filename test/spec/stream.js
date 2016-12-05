'use strict';

const test = require('ava');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const es6toamd = require('../../index');

function compare (output, result) {
    return output.replace(/\s/g, '') === result.replace(/\s/g, '');
}

function convert (name, callback) {
    const path1 = path.join(__dirname, '/../fixture/', name, 'input.js');
    const path2 = path.join(__dirname, '/../fixture/', name, 'output.js');
    const readStream = fs.createReadStream(path1, 'utf8');
    var result;
    const writeStream = new stream.Writable({
        write(chunk, encoding, callback) {
            result = chunk.toString();
            callback();
        }
    });
    readStream.pipe(es6toamd.stream()).pipe(writeStream)
    .on('error', callback)
    .on('finish', function () {
        const input = fs.readFileSync(path1, 'utf8');
        const output = fs.readFileSync(path2, 'utf8');
        const isValid = compare(output, result);
        if (!isValid) {
            console.log(output);
            console.log(result);
        }
        callback(null, isValid);
    });
}

test.cb('converter is defined', t => {
    convert('one-import', function (err, isValid) {
        t.truthy(isValid);
        t.end();
    });
});

