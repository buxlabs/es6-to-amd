'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')
const es6toamd = require('../../index')

function compare (output, result) {
  return output.replace(/\s/g, '') === result.replace(/\s/g, '')
}

function convert (name) {
  const path1 = path.join(__dirname, '/../fixture/', name, 'input.js')
  const path2 = path.join(__dirname, '/../fixture/', name, 'output.js')
  const input = fs.readFileSync(path1, 'utf8')
  const output = fs.readFileSync(path2, 'utf8')
  const result = es6toamd(input)
  const isValid = compare(output, result)
  if (!isValid) {
    console.log('-- INPUT --')
    console.log(input)
    console.log('-- OUTPUT --')
    console.log(output)
    console.log('-- RESULT --')
    console.log(result)
  }
  return isValid
}

test('it converts one import', t => {
  t.truthy(convert('one-import'))
})

test('it does not convert files without import', t => {
  t.truthy(convert('no-import'))
})

test('it does not convert files without import for function expression', t => {
  t.truthy(convert('no-import-function-expression'))
})

test('it does add use strict if the result code has no with statement', t => {
  t.truthy(convert('conditional-use-strict'))
})

test('it does convert simple object expressions', t => {
  t.truthy(convert('object-expression'))
})

test('it works for object expression with other code', t => {
  t.truthy(convert('object-expression-with-code'))
})

test('it does convert object descructuring', t => {
  t.truthy(convert('one-destructuring-import'))
})

test('it does convert object descructuring for multiple specifiers', t => {
  t.truthy(convert('two-destructuring-imports'))
})

test('it does generate free identifiers', t => {
  t.truthy(convert('two-different-destructuring-imports'))
})

test('it does work for side effects', t => {
  t.truthy(convert('side-effect'))
})

test('it does work for side effects that are not the last dependency', t => {
  t.truthy(convert('side-effect-middle'))
})

test('it works for duplicated properties', t => {
  t.truthy(convert('duplicated-import'))
})

test('it works for multiple named exports', t => {
  t.truthy(convert('multiple-named-exports'))
})

test('it works for multiple exports', t => {
  t.truthy(convert('multiple-exports'))
})

test('it works for named exports with other code', t => {
  t.truthy(convert('multiple-exports-fns'))
})

test('it works for file with named exports and imports', t => {
  t.truthy(convert('multiple-exports-and-import'))
})

test('it imports complete modules', t => {
  t.truthy(convert('import-complete-module'))
})

test('it works for renamed imports', t => {
  t.truthy(convert('renamed-imports'))
})

test('it works for revealing exports', t => {
  t.truthy(convert('revealing-exports'))
})

test('it works multiple revealing exports', t => {
  t.truthy(convert('multiple-revealing-exports'))
})

test('it works for default array export', t => {
  t.truthy(convert('export-default-array'))
})

test('it works for named function expression', t => {
  t.truthy(convert('named-function-expression'))
})

test('it works for dynamic imports', t => {
  t.truthy(convert('dynamic-import'))
})
