'use strict'

const AbstractSyntaxTree = require('abstract-syntax-tree')
const { identifier, unique } = require('pure-utilities/array')
const { flatten } = require('pure-utilities/collection')

const {
  BlockStatement,
  CallExpression,
  ExpressionStatement,
  FunctionExpression,
  Identifier,
  Literal,
  NewExpression,
  ReturnStatement
} = AbstractSyntaxTree

class Module extends AbstractSyntaxTree {
  convert () {
    if (this.has('ImportDeclaration') || this.has('ImportExpression')) {
      this.convertCodeWithImportDeclarations()
    } else if (this.has('ExportDefaultDeclaration')) {
      this.convertExportDefaultDeclarationToDefine()
    } else if (this.has('ExportNamedDeclaration')) {
      this.convertExportNamedDeclarationToDefine()
    }
  }

  convertCodeWithImportDeclarations () {
    const pairs = this.getDependencyPairs()
    if (this.has('ImportExpression')) {
      pairs.unshift({ element: 'require', param: 'require' })
      this.convertImportExpressions()
    }
    this.remove({ type: 'ImportDeclaration' })
    this.normalizePairs(pairs)
    if (this.has('ExportDefaultDeclaration')) {
      this.convertExportDefaultDeclarationToReturn()
    } else if (this.has('ExportNamedDeclaration')) {
      this.convertExportNamedDeclarations()
    }
    this.prependUseStrictLiteral()
    this.wrapWithDefineWithArrayExpression(pairs)
  }

  prependUseStrictLiteral () {
    this.prepend(new ExpressionStatement({
      expression: new Literal({ value: 'use strict' })
    }))
  }

  isSideEffectImportDeclaration (node) {
    return node.source && node.source.type === 'Literal' && node.specifiers.length === 0
  }

  getDependencyPairs () {
    const dependencyToIdentifierMap = {}
    const imports = this.find('ImportDeclaration')
    const ids = unique(imports.map(item => item.name))
    const result = flatten(imports.map(node => {
      if (this.isSideEffectImportDeclaration(node)) {
        return {
          element: node.source.value
        }
      }
      return node.specifiers.map(function (specifier) {
        if (specifier.type === 'ImportDefaultSpecifier' || specifier.type === 'ImportNamespaceSpecifier') {
          return this.getLocalSpecifier(node, specifier)
        }
        if (specifier.type === 'ImportSpecifier') {
          let param
          const value = node.source.value
          if (specifier.imported.name !== specifier.local.name) {
            return this.getLocalSpecifier(node, specifier)
          } else if (Object.prototype.hasOwnProperty.call(dependencyToIdentifierMap, value)) {
            param = dependencyToIdentifierMap[value]
          } else {
            const identifiers = unique(flatten(ids)).concat(Object.values(dependencyToIdentifierMap))
            param = identifier(identifiers)
            dependencyToIdentifierMap[value] = param
          }
          return {
            param,
            element: node.source.value,
            name: specifier.local.name
          }
        }
      }.bind(this))
    }))
    return result.sort((a, b) => {
      if (a.param && !b.param) { return -1 }
      if (!a.param && b.param) { return 1 }
      return 0
    })
  }

  getLocalSpecifier (node, specifier) {
    return {
      element: node.source.value,
      param: specifier.local.name
    }
  }

  convertImportExpressions () {
    this.replace(node => {
      if (node.type !== 'ImportExpression') {
        return node
      }
      const resolve = { type: 'Identifier', name: 'resolve' }
      const reject = { type: 'Identifier', name: 'reject' }
      const defaultIdentifier = { type: 'Identifier', name: 'default' }
      const value = { type: 'Identifier', name: 'value' }
      const module = { type: 'Identifier', name: 'module' }
      const enumerable = { type: 'Identifier', name: 'enumerable' }
      return this.getNewExpression('Promise', [
        this.getFunctionExpression([resolve, reject], [
          this.getCallExpression('require', [
            this.getArrayExpression([node.source]),
            this.getFunctionExpression([module], [
              this.getCallExpression('resolve', [
                this.getConditionalExpression(
                  this.getLogicalExpression(
                    this.getBinaryExpression(this.getTypeof(module), '!==', new Literal({ value: 'object' })),
                    '||',
                    this.getBinaryExpression(new Literal({ value: 'default' }), 'in', module)
                  ),
                  this.getObjectExpression([this.getProperty(defaultIdentifier, module)]),
                  this.getCallExpression(this.getMemberExpression('Object', 'defineProperty'), [
                    module,
                    new Literal({ value: 'default' }),
                    this.getObjectExpression([
                      this.getProperty(value, module),
                      this.getProperty(enumerable, new Literal({ value: false }))
                    ])
                  ])
                )
              ])
            ]),
            reject
          ])
        ])
      ])
    })
  }

  convertExportNamedDeclarations () {
    const declarations = this.find('ExportNamedDeclaration')
    this.convertExportNamedDeclarationToDeclaration()
    this.remove({ type: 'ExportNamedDeclaration' })
    this.append(new ReturnStatement({
      argument: this.getObjectExpressionForDeclarations(declarations)
    }))
  }

  convertExportNamedDeclarationToDeclaration () {
    this.replace({
      enter: function (node) {
        if (node.type === 'ExportNamedDeclaration' && node.declaration) {
          return node.declaration
        }
      }
    })
  }

  convertExportDefaultDeclarationToDefine () {
    this.prependUseStrictLiteral()
    this.convertExportDefaultDeclarationToReturn()
    this.wrap(body => {
      return [this.getDefineWithFunctionExpression(body)]
    })
  }

  getDefineWithFunctionExpression (body) {
    return this.getDefine([this.getFunctionExpression([], body)])
  }

  convertExportDefaultDeclarationToReturn () {
    this.replace({
      enter: node => {
        if (node.type === 'ExportDefaultDeclaration') {
          node.type = 'ReturnStatement'
          node.argument = node.declaration
          return node
        }
      }
    })
  }

  getDefine (nodes) {
    return new ExpressionStatement({
      expression: new CallExpression({
        callee: new Identifier({ name: 'define' }),
        arguments: nodes
      })
    })
  }

  convertExportNamedDeclarationToDefine () {
    this.prependUseStrictLiteral()
    this.convertExportNamedDeclarations()
    this.wrap(body => {
      return [this.getDefineWithFunctionExpression(body)]
    })
  }

  getFunctionExpression (params, body) {
    return new FunctionExpression({
      params: params,
      body: new BlockStatement({ body })
    })
  }

  getNewExpression (name, args) {
    return new NewExpression({
      callee: new Identifier({ name }),
      arguments: args
    })
  }

  getCallExpression (name, args) {
    return new CallExpression({
      callee: typeof name === 'string' ? new Identifier({ name }) : name,
      arguments: args
    })
  }

  getMemberExpression (object, member) {
    return {
      type: 'MemberExpression',
      object: {
        type: 'Identifier',
        name: object
      },
      property: {
        type: 'Identifier',
        name: member
      }
    }
  }

  getConditionalExpression (test, consequent, alternate) {
    return {
      type: 'ConditionalExpression',
      test: test,
      consequent: consequent,
      alternate: alternate
    }
  }

  getLogicalExpression (left, operator, right) {
    return {
      type: 'LogicalExpression',
      left: left,
      operator: operator,
      right: right
    }
  }

  getBinaryExpression (left, operator, right) {
    return {
      type: 'BinaryExpression',
      left: left,
      operator: operator,
      right: right
    }
  }

  getTypeof (argument) {
    return {
      type: 'UnaryExpression',
      prefix: true,
      operator: 'typeof',
      argument: argument
    }
  }

  getProperty (nodeOrKey, shorthandOrValue) {
    return {
      type: 'Property',
      key: nodeOrKey,
      value: typeof shorthandOrValue === 'boolean' || typeof shorthandOrValue === 'undefined' ? nodeOrKey : shorthandOrValue,
      shorthand: shorthandOrValue === true,
      kind: 'init'
    }
  }

  getObjectExpression (properties) {
    return {
      type: 'ObjectExpression',
      properties: properties
    }
  }

  getObjectExpressionForDeclarations (declarations) {
    return this.getObjectExpression(this.mapDeclarationsToProperties(declarations))
  }

  mapDeclarationsToProperties (declarations) {
    return flatten(declarations.map(this.mapDeclarationToProperty.bind(this)))
  }

  mapDeclarationToProperty (declaration) {
    if (!declaration.declaration && declaration.specifiers) {
      return declaration.specifiers.map(node => {
        return this.getProperty(node.local, true)
      })
    }
    if (declaration.declaration.type === 'VariableDeclaration') {
      return declaration.declaration.declarations.map(node => {
        return this.getProperty(node.id)
      })
    }
    return this.getProperty(declaration.declaration.id)
  }

  normalizePairs (pairs) {
    const nodes = pairs.filter(pair => !!pair.name)
    const names = nodes.map(node => node.name)
    this.replace({
      leave: (current, parent) => {
        if (current.type === 'Identifier') {
          const index = names.indexOf(current.name)
          if (index !== -1) {
            const pair = nodes[index]
            return this.convertIdentifierToMemberExpression(pair)
          }
        }
        return current
      }
    })
  }

  convertIdentifierToMemberExpression (pair, current) {
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
    }
  }

  getArrayExpression (elements) {
    return { type: 'ArrayExpression', elements: elements }
  }

  wrapWithDefineWithArrayExpression (pairs) {
    pairs = unique(pairs, item => item.element + item.param)
    const elements = pairs.map(pair => pair.element)
      .map(function (element) {
        return { type: 'Literal', value: element }
      })
    const params = pairs.filter(pair => pair.param).map(pair => pair.param)
      .map(function (param) {
        return { type: 'Identifier', name: param }
      })
    this.wrap(body => {
      return [this.getDefine([
        this.getArrayExpression(elements),
        this.getFunctionExpression(params, body)
      ])]
    })
  }
}

module.exports = Module
