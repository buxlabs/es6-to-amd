'use strict';

const _ = require('underscore');
const AbstractSyntaxTree = require('@buxlabs/ast');

class Module extends AbstractSyntaxTree {

    convert () {
        var pairs = this.getDependencyPairs();
        if (pairs.length > 0) {
            this.remove({ type: 'ImportDeclaration' });
            this.prependUseStrict();
            if (this.has('ExportDefaultDeclaration')) {
                this.convertExportDefaultToReturn();
            } else if (this.has('ExportNamedDeclaration')) {
                this.convertExportNamedToReturn();
            }
            this.normalizeIdentifiers(pairs);
            this.wrapWithDefineWithPairs(_.unique(pairs, item => item.element + item.param));
        } else if (this.has('ExportDefaultDeclaration')) {
            this.convertExportDefaultDeclarationToDefine();
        } else if (this.has('ExportNamedDeclaration')) {
            this.convertExportNamedDeclarationToDefine();
        }
    }
    
    prependUseStrict () {
        this.prepend({
            type: 'ExpressionStatement',
            expression: {
                type: 'Literal',
                value: 'use strict'
            }
        });
    }
    
    getIdentifiers () {
        return _.unique(this.find('Identifier').map(item => item.name));
    }
    
    generateFreeIdentifier (takenIdentifiers) {
        var identifiers = _.unique(_.flatten(this.getIdentifiers())).concat(takenIdentifiers);
        var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        var index = 0;
        while (identifiers.indexOf(alphabet[index]) !== -1) {
            index += 1;
            if (index === alphabet.length) {
                index = 0;
                alphabet = alphabet.map(character => '_' + character);
            }
        }
        return alphabet[index];
    }

    getDependencyPairs () {
        var dependencyToIdentifierMap = {};
        return _.flatten(this.ast.body.map(function (node) {
            if (node.type === 'ImportDeclaration') {
                if (node.source &&
                    node.source.type === 'Literal' &&
                    node.specifiers.length === 0) {
                    return {
                        element: node.source.value
                    };
                }
                return node.specifiers.map(function (specifier) {
                    
                    if (specifier.type === 'ImportSpecifier') {
                        var identifier;
                        var value = node.source.value;
                        if (dependencyToIdentifierMap.hasOwnProperty(value)) {
                            identifier = dependencyToIdentifierMap[value];
                        } else {
                            identifier = this.generateFreeIdentifier(Object.values(dependencyToIdentifierMap));
                            dependencyToIdentifierMap[value] = identifier;
                        }
                        return {
                            element: node.source.value,
                            param: identifier,
                            name: specifier.local.name
                        };
                    }
                    return {
                        element: node.source.value,
                        param: specifier.local.name
                    };
                }.bind(this));
            }
            return null;
        }.bind(this)).filter(node => !!node));
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
    
    convertExportNamedToReturn () {
        var declarations = this.getExportNamedDeclarations();
        this.remove({ type: 'ExportNamedDeclaration' });
        this.append({
            type: 'ReturnStatement',
            argument: this.getObjectExpression(declarations)
        });
    }

    convertExportDefaultDeclarationToDefine () {
        this.ast.body = this.ast.body.map(node => {
            if (node.type === 'ExportDefaultDeclaration') {
                return this.getDefine([ node.declaration ]);
            }
            return node;
        });
    }
    
    getDefine (nodes) {
        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'define' },
                arguments: nodes
            }
        };
    }
    
    getExportNamedDeclarations () {
        var imports = this.ast.body.filter(node => {
            return node.type === 'ExportNamedDeclaration';
        });
        return imports.reduce((previous, current) => {
            if (current.declaration.type === 'FunctionDeclaration') {
                return previous.concat(current.declaration);
            }
            return previous.concat(current.declaration.declarations);
        }, []);
    }
    
    convertExportNamedDeclarationToDefine () {
        this.ast.body = [
            this.getDefine([
                this.getExportNamedDeclarationsBody()
            ])
        ];
    }
    
    getExportNamedDeclarationsBody () {
        var declarations = this.getExportNamedDeclarations();
        this.ast.body = this.ast.body.filter(node => {
            return node.type !== 'ExportNamedDeclaration';
        });
        var hasOtherCode = this.ast.body.length > 0;
        return this.convertExportNamedDeclarationToBody(hasOtherCode, declarations);
    }
    
    convertExportNamedDeclarationToBody (hasOtherCode, declarations) {
        if (hasOtherCode) {
            this.prependUseStrict();
            return this.getFunctionExpression([], this.ast.body.concat([
                {
                    type: 'ReturnStatement',
                    argument: this.getObjectExpression(declarations)
                }
            ]));
        }
        return this.getObjectExpression(declarations);
    }
    
    getFunctionExpression (params, body) {
        return {
            type: 'FunctionExpression',
            params: params,
            body: {
                type: 'BlockStatement',
                body: body
            }
        };
    }
    
    getObjectExpression (declarations) {
        return {
            "type": "ObjectExpression",
            "properties": declarations.map(declaration => {
                if (declaration.type === 'FunctionDeclaration') {
                    return {
                        type: "Property",
                        key: declaration.id,
                        value: declaration
                    };
                }
                return {
                    type: "Property",
                    key: declaration.id,
                    value: declaration.init
                };
            })
        };
    }

    normalizeIdentifiers (pairs) {
        let nodes = pairs.filter(pair => !!pair.name);
        let names = nodes.map(node => node.name);
        this.replace({
            leave: function (current, parent) {
                if (current.type === 'Identifier') {
                    let index = names.indexOf(current.name);
                    if (index !== -1) {
                        let pair = nodes[index];
                        return {
                            type: 'MemberExpression',
                            object: {
                                type: 'Identifier',
                                name: pair.param
                            },
                            property: {
                                type: 'Identifier',
                                name: pair.name
                            }
                        };
                    }
                }
                return current;
            }
        });
    }

    wrapWithDefineWithPairs (pairs) {
        var body = this.ast.body;
        var elements = pairs.map(pair => pair.element)
        .map(function (element) {
            return { type: 'Literal', value: element };
        });
        var params = pairs.filter(pair => pair.param).map(pair => pair.param)
        .map(function(param) {
            return { type: 'Identifier', name: param };
        });
        this.ast.body = [{
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: 'define' },
                arguments: [
                    {
                        type: 'ArrayExpression',
                        elements: elements
                    },
                    {
                        type: 'FunctionExpression',
                        params: params,
                        body: {
                            type: 'BlockStatement',
                            body: body
                        }
                    }
                ]
            }
        }];
    }

}

module.exports = Module;
