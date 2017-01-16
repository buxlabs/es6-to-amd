'use strict';

const acorn = require('acorn');
const escodegen = require('escodegen');
const AbstractSyntaxTree = require('@buxlabs/ast');

class Module extends AbstractSyntaxTree {

    convert () {
        var pairs = this.getDependencyPairs();
        if (pairs.length > 0) {
            this.remove({ type: 'ImportDeclaration' });
            this.convertExportDefaultToReturn();
            this.prepend({
                type: 'Literal',
                value: 'use strict'
            });
            this.normalizeIdentifiers(pairs);
            this.wrapWithDefineWithPairs(pairs);
        } else if (this.has('ExportDefaultDeclaration')) {
            this.convertExportDefaultToDefine();
        }
    }

    getDependencyPairs () {
        return this.ast.body.map(function (node) {
            if (node.type === 'ImportDeclaration') {
                var specifier = node.specifiers[0];
                if (specifier.type === 'ImportSpecifier') {
                    return {
                        element: node.source.value,
                        param: 'a',
                        name: specifier.local.name
                    };
                }
                return {
                    element: node.source.value,
                    param: specifier.local.name
                };

            }
            return null;
        }).filter(node => !!node);
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

    convertExportDefaultToDefine () {
        this.ast.body = this.ast.body.map(function (node) {
            if (node.type === 'ExportDefaultDeclaration') {
                return {
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: { type: 'Identifier', name: 'define' },
                        arguments: [
                            node.declaration
                        ]
                    }
                };
            }
            return node;
        });
    }

    normalizeIdentifiers (pairs) {
        pairs
        .filter(pair => !!pair.name)
        .forEach(pair => {
            let identifiers = this.find(`Identifier[name=${pair.name}]`);
            
        });
    }

    wrapWithDefineWithPairs (pairs) {
        var body = this.ast.body;
        this.ast.body = [{
            type: 'ExpressionStatement',
            expression: {
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
            }
        }];
    }

    toSource () {
        return escodegen.generate(this.ast);
    }

}

module.exports = Module;

