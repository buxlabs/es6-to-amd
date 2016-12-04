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
        this.addUseStrict();
        this.wrapWithDefine();
    }

    getDependencyPairs () {
        return [
            { 'backbone': 'Backbone' }
        ];
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

    wrapWithDefine () {
        var body = this.ast.body;
        this.ast.body = [{
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'define' },
            arguments: [
                {
                    type: 'ArrayExpression',
                    elements: [
                        { type: 'Literal', value: 'backbone' }
                    ]
                },
                {
                    type: 'FunctionExpression',
                    params: [
                        { type: 'Identifier', name: 'Backbone' }
                    ],
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

