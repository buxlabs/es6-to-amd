'use strict';

const _ = require('underscore');
const AbstractSyntaxTree = require('@buxlabs/ast');

class Module extends AbstractSyntaxTree {

    convert () {
        if (this.has('ImportDeclaration')) {
            var pairs = this.getDependencyPairs();
            this.remove({ type: 'ImportDeclaration' });
            this.normalizePairs(pairs);
            if (this.has('ExportDefaultDeclaration')) {
                this.convertExportDefaultDeclarationToReturn();
            } else if (this.has('ExportNamedDeclaration')) {
                this.convertExportNamedDeclarations();
            }
            this.prependUseStrictLiteral();
            this.wrapWithDefineWithArrayExpression(pairs);
        } else if (this.has('ExportDefaultDeclaration')) {
            this.convertExportDefaultDeclarationToDefine();
        } else if (this.has('ExportNamedDeclaration')) {
            this.convertExportNamedDeclarationToDefine();
        }
    }
    
    prependUseStrictLiteral () {
        this.prepend({
            type: 'ExpressionStatement',
            expression: {
                type: 'Literal',
                value: 'use strict'
            }
        });
    }
    
    getIdentifiers () {
        return this.find('Identifier');
    }
    
    generateFreeIdentifier (takenIdentifiers) {
        var ids = _.unique(this.getIdentifiers().map(item => item.name));
        var identifiers = _.unique(_.flatten(ids)).concat(takenIdentifiers);
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
    
    isSideEffectImportDeclaration(node) {
        return node.source && node.source.type === 'Literal' && node.specifiers.length === 0;
    }

    getDependencyPairs () {
        var dependencyToIdentifierMap = {};
        var imports = this.find('ImportDeclaration');
        return _.flatten(imports.map(node => {
            if (this.isSideEffectImportDeclaration(node)) {
                return {
                    element: node.source.value
                };
            }
            return node.specifiers.map(function (specifier) {
                if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
                    return {
                        element: node.source.value,
                        param: specifier.local.name
                    };
                }
                if (specifier.type === 'ImportSpecifier') {
                    var identifier;
                    var value = node.source.value;
                    if (specifier.imported.name !== specifier.local.name) {
                        return {
                            element: node.source.value,
                            param: specifier.local.name
                        };
                    } else if (dependencyToIdentifierMap.hasOwnProperty(value)) {
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
            }.bind(this));
        }));
    }
    
    convertExportNamedDeclarations () {
        var declarations = this.find('ExportNamedDeclaration');
        this.convertExportNamedDeclarationToDeclaration();
        this.remove({ type: 'ExportNamedDeclaration' });
        this.append({
            type: 'ReturnStatement',
            argument: this.getObjectExpression(declarations)
        });
    }
    
    convertExportNamedDeclarationToDeclaration () {
        this.replace({
            enter: function (node) {
                if (node.type === 'ExportNamedDeclaration' && node.declaration) {
                    return node.declaration;
                }
            }
        });
    }

    convertExportDefaultDeclarationToDefine () {
        this.prependUseStrictLiteral();
        this.convertExportDefaultDeclarationToReturn();
        this.wrap(body => {
            return [this.getDefineWithFunctionExpression(body)];
        });
    }
    
    getDefineWithFunctionExpression (body) {
        return this.getDefine([this.getFunctionExpression([], body)]);
    }
    
    convertExportDefaultDeclarationToReturn () {
        this.replace({
            enter: node => {
                if (node.type === 'ExportDefaultDeclaration') {
                    node.type = 'ReturnStatement';
                    node.argument = node.declaration;
                    return node;
                }
            }
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
    
    convertExportNamedDeclarationToDefine () {
        this.prependUseStrictLiteral();
        this.convertExportNamedDeclarations();
        this.wrap(body => {
            return [this.getDefineWithFunctionExpression(body)];
        });
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
                if (!declaration.declaration && declaration.specifiers) {
                    return {
                        type: "Property",
                        key: declaration.specifiers[0].local,
                        value: declaration.specifiers[0].local,
                        shorthand: true,
                        kind: "init"
                    };
                }
                if (declaration.declaration.type === "VariableDeclaration") {
                    return {
                        type: "Property",
                        key: declaration.declaration.declarations[0].id,
                        value: declaration.declaration.declarations[0].id,
                        kind: "init"
                    };
                }
                return {
                    type: "Property",
                    key: declaration.declaration.id,
                    value: declaration.declaration.id,
                    kind: "init"
                };

            })
        };
    }

    normalizePairs (pairs) {
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
    
    getArrayExpression (elements) {
        return { type: 'ArrayExpression', elements: elements };
    }

    wrapWithDefineWithArrayExpression (pairs) {
        pairs = _.unique(pairs, item => item.element + item.param);
        var elements = pairs.map(pair => pair.element)
        .map(function (element) {
            return { type: 'Literal', value: element };
        });
        var params = pairs.filter(pair => pair.param).map(pair => pair.param)
        .map(function(param) {
            return { type: 'Identifier', name: param };
        });
        this.wrap(body => {
            return [this.getDefine([
                this.getArrayExpression(elements),
                this.getFunctionExpression(params, body)
            ])];
        });
    }

}

module.exports = Module;
