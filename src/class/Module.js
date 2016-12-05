'use strict';

const acorn = require('acorn');
const escodegen = require('escodegen');

class Module {
    
    constructor (source) {
        this.source = source;
        this.ast = acorn.parse(source, {
            sourceType: 'module'
        });
    }

    convert () {
        var pairs = this.getDependencyPairs();
        this.removeImports();
        this.convertExportDefaultToReturn();
        if (pairs.length > 0) {
            this.addUseStrict();
            this.wrapWithDefine(pairs);
        }
    }

    getDependencyPairs () {
        return this.ast.body.map(function (node) {
            if (node.type === 'ImportDeclaration') {
                return {
                    element: node.source.value,
                    param: node.specifiers[0].local.name
                };
            }
            return null;
        }).filter(node => !!node);
    }

    removeImports () {
        this.ast.body = this.ast.body.filter(function (node) {
            return node.type !== 'ImportDeclaration';
        });
    }

    convertExportDefaultToReturn () {
        this.ast.body = this.ast.body.map(function (node) {
            if (node.type === 'ExportDefaultDeclaration') {
                return {
                    type: 'ReturnStatement',
                    argument: node.declaration
                };
            }
            return node;
        });
    }

    addUseStrict () {
        this.ast.body.unshift({
            type: 'Literal',
            value: 'use strict'
        });
    }

    wrapWithDefine (pairs) {
        var body = this.ast.body;
        this.ast.body = [{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'define' },
            arguments: [
                {
                    type: 'ArrayExpression',
                    elements: pairs.map(function (pair) { return { type: 'Literal', value: pair.element }; })
                },
                {
                    type: 'FunctionExpression',
                    params: pairs.map(function(pair) {return { type: 'Identifier', name: pair.param }; }),
                    body: {
                        type: 'BlockStatement',
                        body: body
                    }
                }
            ]
        }];
    }

    toSource () {
        return escodegen.generate(this.ast);
    }

}

module.exports = Module;

