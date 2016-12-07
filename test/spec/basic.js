'use strict';

const test = require('ava');
const path = require('path');
const fs = require('fs');
const es6toamd = require('../../index');

function compare (output, result) {
    return output.replace(/\s/g, '') === result.replace(/\s/g, '');
}

function convert (name) {
    const path1 = path.join(__dirname, '/../fixture/', name, 'input.js');
    const path2 = path.join(__dirname, '/../fixture/', name, 'output.js');
    const input = fs.readFileSync(path1, 'utf8');
    const output = fs.readFileSync(path2, 'utf8');
    const result = es6toamd(input);
    const isValid = compare(output, result);
    if (!isValid) {
        console.log(output);
        console.log(result);
    }
    return isValid;
}

test('it converts one import', t => {
    t.truthy(convert('one-import'));
});

test('it does not convert files without import', t => {
    t.truthy(convert('no-import'));
});

test('it does not convert files without import for function expression', t => {
    t.truthy(convert('no-import-function-expression'));
});

test('it does add use strict if the result code has no with statement', t => {
    t.truthy(convert('conditional-use-strict'));
});
