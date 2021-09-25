import antlr4 from 'antlr4'
import { ParseOptions } from './types'
import * as ASTTypes from './ast-types'
import { BaseASTNode } from './ast-types'

type Ctx = any

function toText(ctx: Ctx | null) {
  if (ctx !== null) {
    return ctx.getText()
  }
  return null
}

function mapCommasToNulls(children: Ctx[]) {
  if (children.length === 0) {
    return []
  }

  const values = []
  let comma = true

  for (const el of children) {
    if (comma) {
      if (toText(el) === ',') {
        values.push(null)
      } else {
        values.push(el)
        comma = false
      }
    } else {
      if (toText(el) !== ',') {
        throw new Error('expected comma')
      }
      comma = true
    }
  }

  if (comma) {
    values.push(null)
  }

  return values
}

function isBinOp(op: string): boolean {
  const binOps = [
    '+',
    '-',
    '*',
    '/',
    '**',
    '%',
    '<<',
    '>>',
    '&&',
    '||',
    '&',
    '|',
    '^',
    '<',
    '>',
    '<=',
    '>=',
    '==',
    '!=',
    '=',
    '|=',
    '^=',
    '&=',
    '<<=',
    '>>=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
  ]
  return binOps.includes(op)
}

const transformAST = {
  SourceUnit(ctx: Ctx): ASTTypes.SourceUnit {
    // last element is EOF terminal node
    return {
      type: 'SourceUnit',
      children: (this as any).visit(ctx.children.slice(0, -1)),
    }
  },

  EnumDefinition(ctx: Ctx): ASTTypes.EnumDefinition {
    return {
      type: 'EnumDefinition',
      name: toText(ctx.identifier()),
      members: (this as any).visit(ctx.enumValue()),
    }
  },

  EnumValue(ctx: Ctx) {
    return {
      name: toText(ctx.identifier()),
    }
  },

  UsingForDeclaration(ctx: Ctx) {
    let typeName = null
    if (toText(ctx.getChild(3)) !== '*') {
      typeName = (this as any).visit(ctx.getChild(3))
    }

    return {
      typeName,
      libraryName: toText(ctx.identifier()),
    }
  },

  PragmaDirective(ctx: Ctx) {
    // this converts something like >= 0.5.0  <0.7.0
    // in >=0.5.0 <0.7.0
    const value = ctx
      .pragmaValue()
      .children[0].children.map((x: any) => toText(x))
      .join(' ')

    return {
      name: toText(ctx.pragmaName()),
      value,
    }
  },

  ContractDefinition(ctx: Ctx) {
    const name = toText(ctx.identifier())
    const kind = toText(ctx.getChild(0))

    ;(this as any)._currentContract = name

    return {
      name,
      baseContracts: (this as any).visit(ctx.inheritanceSpecifier()),
      subNodes: (this as any).visit(ctx.contractPart()),
      kind,
    }
  },

  InheritanceSpecifier(ctx: Ctx) {
    const exprList = ctx.expressionList()
    const args =
      exprList != null ? (this as any).visit(exprList.expression()) : []

    return {
      baseName: (this as any).visit(ctx.userDefinedTypeName()),
      arguments: args,
    }
  },

  ContractPart(ctx: Ctx) {
    return (this as any).visit(ctx.children[0])
  },

  FunctionDefinition(ctx: Ctx) {
    let isConstructor = false
    let isFallback = false
    let isReceiveEther = false
    let isVirtual = false
    let name = null
    let parameters = []
    let returnParameters = null
    let visibility = 'default'

    let block = null
    if (ctx.block()) {
      block = (this as any).visit(ctx.block())
    }

    const modifiers = ctx
      .modifierList()
      .modifierInvocation()
      .map((mod: any) => (this as any).visit(mod))

    let stateMutability = null
    if (ctx.modifierList().stateMutability(0)) {
      stateMutability = toText(ctx.modifierList().stateMutability(0))
    }

    // see what type of function we're dealing with
    switch (toText(ctx.functionDescriptor().getChild(0))) {
      case 'constructor':
        parameters = (this as any).visit(ctx.parameterList())

        if (
          ctx.returnParameters() &&
          ctx.returnParameters().parameterList().parameter().length > 0
        ) {
          throw new Error('Constructors cannot have return parameters')
        }

        // error out on incorrect function visibility
        if (ctx.modifierList().InternalKeyword(0)) {
          visibility = 'internal'
        } else if (ctx.modifierList().PublicKeyword(0)) {
          visibility = 'public'
        } else {
          visibility = 'default'
        }

        isConstructor = true
        break
      case 'fallback':
        if (ctx.parameterList().parameter().length > 0) {
          throw new Error('Fallback functions cannot have parameters')
        }

        if (
          ctx.returnParameters() &&
          ctx.returnParameters().parameterList().parameter().length > 0
        ) {
          throw new Error('Fallback functions cannot have return parameters')
        }

        // error out on incorrect function visibility
        if (!ctx.modifierList().ExternalKeyword(0)) {
          throw new Error('Fallback functions have to be declared "external"')
        }
        visibility = 'external'

        isFallback = true
        break
      case 'receive':
        if (ctx.parameterList().parameter().length > 0) {
          throw new Error('Receive Ether functions cannot have parameters')
        }

        if (
          ctx.returnParameters() &&
          ctx.returnParameters().parameterList().parameter().length > 0
        ) {
          throw new Error(
            'Receive Ether functions cannot have return parameters'
          )
        }

        // error out on incorrect function visibility
        if (!ctx.modifierList().ExternalKeyword(0)) {
          throw new Error(
            'Receive Ether functions have to be declared "external"'
          )
        }
        visibility = 'external'

        // error out on incorrect function payability
        if (
          !ctx.modifierList().stateMutability(0) ||
          !ctx.modifierList().stateMutability(0).PayableKeyword(0)
        ) {
          throw new Error(
            'Receive Ether functions have to be declared "payable"'
          )
        }

        isReceiveEther = true
        break
      case 'function':
        name = ctx.functionDescriptor().identifier(0)
          ? toText(ctx.functionDescriptor().identifier(0))
          : ''

        parameters = (this as any).visit(ctx.parameterList())
        returnParameters = (this as any).visit(ctx.returnParameters())

        // parse function visibility
        if (ctx.modifierList().ExternalKeyword(0)) {
          visibility = 'external'
        } else if (ctx.modifierList().InternalKeyword(0)) {
          visibility = 'internal'
        } else if (ctx.modifierList().PublicKeyword(0)) {
          visibility = 'public'
        } else if (ctx.modifierList().PrivateKeyword(0)) {
          visibility = 'private'
        }

        // check if function is virtual
        if (ctx.modifierList().VirtualKeyword(0)) {
          isVirtual = true
        }

        isConstructor = name === (this as any)._currentContract
        isFallback = name === ''
        break
    }

    let override
    const overrideSpecifier = ctx.modifierList().overrideSpecifier()
    if (overrideSpecifier.length === 0) {
      override = null
    } else {
      override = (this as any).visit(overrideSpecifier[0].userDefinedTypeName())
    }

    return {
      name,
      parameters,
      returnParameters,
      body: block,
      visibility,
      modifiers,
      override,
      isConstructor,
      isReceiveEther,
      isFallback,
      isVirtual,
      stateMutability,
    }
  },

  ModifierInvocation(ctx: Ctx) {
    const exprList = ctx.expressionList()

    let args
    if (exprList != null) {
      args = (this as any).visit(exprList.expression())
    } else if (ctx.children.length > 1) {
      args = []
    } else {
      args = null
    }

    return {
      name: toText(ctx.identifier()),
      arguments: args,
    }
  },

  TypeNameExpression(ctx: Ctx) {
    let typeName = ctx.elementaryTypeName()
    if (!typeName) {
      typeName = ctx.userDefinedTypeName()
    }
    return {
      typeName: (this as any).visit(typeName),
    }
  },

  TypeName(ctx: Ctx) {
    if (ctx.children.length > 2) {
      let length = null
      if (ctx.children.length === 4) {
        length = (this as any).visit(ctx.getChild(2))
      }

      return {
        type: 'ArrayTypeName',
        baseTypeName: (this as any).visit(ctx.typeName()),
        length,
      }
    }
    if (ctx.children.length === 2) {
      return {
        type: 'ElementaryTypeName',
        name: toText(ctx.getChild(0)),
        stateMutability: toText(ctx.getChild(1)),
      }
    }
    return (this as any).visit(ctx.getChild(0))
  },

  FunctionTypeName(ctx: Ctx) {
    const parameterTypes = ctx
      .functionTypeParameterList(0)
      .functionTypeParameter()
      .map((typeCtx: any) => (this as any).visit(typeCtx))

    let returnTypes = []
    if (ctx.functionTypeParameterList(1)) {
      returnTypes = ctx
        .functionTypeParameterList(1)
        .functionTypeParameter()
        .map((typeCtx: any) => (this as any).visit(typeCtx))
    }

    let visibility = 'default'
    if (ctx.InternalKeyword(0)) {
      visibility = 'internal'
    } else if (ctx.ExternalKeyword(0)) {
      visibility = 'external'
    }

    let stateMutability = null
    if (ctx.stateMutability(0)) {
      stateMutability = toText(ctx.stateMutability(0))
    }

    return {
      parameterTypes,
      returnTypes,
      visibility,
      stateMutability,
    }
  },

  ReturnStatement(ctx: Ctx) {
    let expression = null
    if (ctx.expression()) {
      expression = (this as any).visit(ctx.expression())
    }

    return { expression }
  },

  EmitStatement(ctx: Ctx) {
    return {
      eventCall: (this as any).visit(ctx.functionCall()),
    }
  },

  FunctionCall(ctx: Ctx) {
    let args = []
    const names = []

    const ctxArgs = ctx.functionCallArguments()
    if (ctxArgs.expressionList()) {
      args = ctxArgs
        .expressionList()
        .expression()
        .map((exprCtx: any) => (this as any).visit(exprCtx))
    } else if (ctxArgs.nameValueList()) {
      for (const nameValue of ctxArgs.nameValueList().nameValue()) {
        args.push((this as any).visit(nameValue.expression()))
        names.push(toText(nameValue.identifier()))
      }
    }

    return {
      expression: (this as any).visit(ctx.expression()),
      arguments: args,
      names,
    }
  },

  StructDefinition(ctx: Ctx) {
    return {
      name: toText(ctx.identifier()),
      members: (this as any).visit(ctx.variableDeclaration()),
    }
  },

  VariableDeclaration(ctx: Ctx) {
    let storageLocation = null
    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation())
    }

    return {
      typeName: (this as any).visit(ctx.typeName()),
      name: toText(ctx.identifier()),
      storageLocation,
      isStateVar: false,
      isIndexed: false,
    }
  },

  EventParameter(ctx: Ctx) {
    let storageLocation = null
    if (ctx.storageLocation(0)) {
      storageLocation = toText(ctx.storageLocation(0))
    }

    return {
      type: 'VariableDeclaration',
      typeName: (this as any).visit(ctx.typeName()),
      name: toText(ctx.identifier()),
      storageLocation,
      isStateVar: false,
      isIndexed: !!ctx.IndexedKeyword(0),
    }
  },

  FunctionTypeParameter(ctx: Ctx) {
    let storageLocation = null
    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation())
    }

    return {
      type: 'VariableDeclaration',
      typeName: (this as any).visit(ctx.typeName()),
      name: null,
      storageLocation,
      isStateVar: false,
      isIndexed: false,
    }
  },

  WhileStatement(ctx: Ctx) {
    return {
      condition: (this as any).visit(ctx.expression()),
      body: (this as any).visit(ctx.statement()),
    }
  },

  DoWhileStatement(ctx: Ctx) {
    return {
      condition: (this as any).visit(ctx.expression()),
      body: (this as any).visit(ctx.statement()),
    }
  },

  IfStatement(ctx: Ctx) {
    const trueBody = (this as any).visit(ctx.statement(0))

    let falseBody = null
    if (ctx.statement().length > 1) {
      falseBody = (this as any).visit(ctx.statement(1))
    }

    return {
      condition: (this as any).visit(ctx.expression()),
      trueBody,
      falseBody,
    }
  },

  TryStatement(ctx: Ctx) {
    let returnParameters = null
    if (ctx.returnParameters()) {
      returnParameters = (this as any).visit(ctx.returnParameters())
    }

    const catchClauses = ctx
      .catchClause()
      .map((exprCtx: any) => (this as any).visit(exprCtx))

    return {
      expression: (this as any).visit(ctx.expression()),
      returnParameters,
      body: (this as any).visit(ctx.block()),
      catchClauses,
    }
  },

  CatchClause(ctx: Ctx) {
    let parameters = null
    if (ctx.parameterList()) {
      parameters = (this as any).visit(ctx.parameterList())
    }

    if (ctx.identifier() && toText(ctx.identifier()) !== 'Error') {
      throw new Error('Expected "Error" identifier in catch clause')
    }

    return {
      isReasonStringType:
        !!ctx.identifier() && toText(ctx.identifier()) === 'Error',
      parameters,
      body: (this as any).visit(ctx.block()),
    }
  },

  UserDefinedTypeName(ctx: Ctx) {
    return {
      namePath: toText(ctx),
    }
  },

  ElementaryTypeName(ctx: Ctx) {
    return {
      name: toText(ctx),
    }
  },

  Block(ctx: Ctx) {
    return {
      statements: (this as any).visit(ctx.statement()),
    }
  },

  ExpressionStatement(ctx: Ctx) {
    return {
      expression: (this as any).visit(ctx.expression()),
    }
  },

  NumberLiteral(ctx: Ctx) {
    const number = toText(ctx.getChild(0))
    let subdenomination = null

    if (ctx.children.length === 2) {
      subdenomination = toText(ctx.getChild(1))
    }

    return {
      number,
      subdenomination,
    }
  },

  MappingKey(ctx: Ctx) {
    if (ctx.elementaryTypeName()) {
      return (this as any).visit(ctx.elementaryTypeName())
    } else if (ctx.userDefinedTypeName()) {
      return (this as any).visit(ctx.userDefinedTypeName())
    } else {
      throw new Error(
        'Expected MappingKey to have either ' +
          'elementaryTypeName or userDefinedTypeName'
      )
    }
  },

  Mapping(ctx: Ctx) {
    return {
      keyType: (this as any).visit(ctx.mappingKey()),
      valueType: (this as any).visit(ctx.typeName()),
    }
  },

  ModifierDefinition(ctx: Ctx) {
    let parameters = null
    if (ctx.parameterList()) {
      parameters = (this as any).visit(ctx.parameterList())
    }

    let isVirtual = false
    if (ctx.VirtualKeyword(0)) {
      isVirtual = true
    }

    let override
    const overrideSpecifier = ctx.overrideSpecifier()
    if (overrideSpecifier.length === 0) {
      override = null
    } else {
      override = (this as any).visit(overrideSpecifier[0].userDefinedTypeName())
    }

    return {
      name: toText(ctx.identifier()),
      parameters,
      body: (this as any).visit(ctx.block()),
      isVirtual,
      override,
    }
  },

  Statement(ctx: Ctx) {
    return (this as any).visit(ctx.getChild(0))
  },

  SimpleStatement(ctx: Ctx) {
    return (this as any).visit(ctx.getChild(0))
  },

  UncheckedStatement(ctx: Ctx) {
    return {
      block: (this as any).visit(ctx.block()),
    }
  },

  Expression(ctx: Ctx): ASTTypes.Expression {
    let op

    switch (ctx.children.length) {
      case 1:
        // primary expression
        return (this as any).visit(ctx.getChild(0))

      case 2:
        op = toText(ctx.getChild(0))

        // new expression
        if (op === 'new') {
          return {
            type: 'NewExpression',
            typeName: (this as any).visit(ctx.typeName()),
          }
        }

        // prefix operators
        if (['+', '-', '++', '--', '!', '~', 'after', 'delete'].includes(op)) {
          return {
            type: 'UnaryOperation',
            operator: op,
            subExpression: (this as any).visit(ctx.getChild(1)),
            isPrefix: true,
          }
        }

        op = toText(ctx.getChild(1))

        // postfix operators
        if (['++', '--'].includes(op)) {
          return {
            type: 'UnaryOperation',
            operator: op,
            subExpression: (this as any).visit(ctx.getChild(0)),
            isPrefix: false,
          }
        }
        break

      case 3:
        // treat parenthesis as no-op
        if (
          toText(ctx.getChild(0)) === '(' &&
          toText(ctx.getChild(2)) === ')'
        ) {
          return {
            type: 'TupleExpression',
            components: [(this as any).visit(ctx.getChild(1))],
            isArray: false,
          }
        }

        // if square parenthesis are present it can only be
        // a typename expression
        if (
          toText(ctx.getChild(1)) === '[' &&
          toText(ctx.getChild(2)) === ']'
        ) {
          return {
            type: 'TypeNameExpression',
            typeName: {
              type: 'ArrayTypeName',
              baseTypeName: (this as any).visit(ctx.getChild(0)),
              length: null,
            },
          }
        }

        op = toText(ctx.getChild(1))

        // tuple separator
        if (op === ',') {
          return {
            type: 'TupleExpression',
            components: [
              (this as any).visit(ctx.getChild(0)),
              (this as any).visit(ctx.getChild(2)),
            ],
            isArray: false,
          }
        }

        // member access
        if (op === '.') {
          return {
            type: 'MemberAccess',
            expression: (this as any).visit(ctx.getChild(0)),
            memberName: toText(ctx.getChild(2)),
          }
        }

        if (isBinOp(op)) {
          return {
            type: 'BinaryOperation',
            operator: op,
            left: (this as any).visit(ctx.getChild(0)),
            right: (this as any).visit(ctx.getChild(2)),
          }
        }
        break

      case 4:
        // function call
        if (
          toText(ctx.getChild(1)) === '(' &&
          toText(ctx.getChild(3)) === ')'
        ) {
          let args = []
          const names = []

          const ctxArgs = ctx.functionCallArguments()
          if (ctxArgs.expressionList()) {
            args = ctxArgs
              .expressionList()
              .expression()
              .map((exprCtx: any) => (this as any).visit(exprCtx))
          } else if (ctxArgs.nameValueList()) {
            for (const nameValue of ctxArgs.nameValueList().nameValue()) {
              args.push((this as any).visit(nameValue.expression()))
              names.push(toText(nameValue.identifier()))
            }
          }

          return {
            type: 'FunctionCall',
            expression: (this as any).visit(ctx.getChild(0)),
            arguments: args,
            names,
          }
        }

        // index access
        if (
          toText(ctx.getChild(1)) === '[' &&
          toText(ctx.getChild(3)) === ']'
        ) {
          return {
            type: 'IndexAccess',
            base: (this as any).visit(ctx.getChild(0)),
            index: (this as any).visit(ctx.getChild(2)),
          }
        }

        // expression with nameValueList
        if (
          toText(ctx.getChild(1)) === '{' &&
          toText(ctx.getChild(3)) === '}'
        ) {
          return {
            type: 'NameValueExpression',
            expression: (this as any).visit(ctx.getChild(0)),
            arguments: (this as any).visit(ctx.getChild(2)),
          }
        }

        break

      case 5:
        // ternary operator
        if (
          toText(ctx.getChild(1)) === '?' &&
          toText(ctx.getChild(3)) === ':'
        ) {
          return {
            type: 'Conditional',
            condition: (this as any).visit(ctx.getChild(0)),
            trueExpression: (this as any).visit(ctx.getChild(2)),
            falseExpression: (this as any).visit(ctx.getChild(4)),
          }
        }

        // index range access
        if (
          toText(ctx.getChild(1)) === '[' &&
          toText(ctx.getChild(2)) === ':' &&
          toText(ctx.getChild(4)) === ']'
        ) {
          return {
            type: 'IndexRangeAccess',
            base: (this as any).visit(ctx.getChild(0)),
            indexEnd: (this as any).visit(ctx.getChild(3)),
          }
        } else if (
          toText(ctx.getChild(1)) === '[' &&
          toText(ctx.getChild(3)) === ':' &&
          toText(ctx.getChild(4)) === ']'
        ) {
          return {
            type: 'IndexRangeAccess',
            base: (this as any).visit(ctx.getChild(0)),
            indexStart: (this as any).visit(ctx.getChild(2)),
          }
        }
        break

      case 6:
        // index range access
        if (
          toText(ctx.getChild(1)) === '[' &&
          toText(ctx.getChild(3)) === ':' &&
          toText(ctx.getChild(5)) === ']'
        ) {
          return {
            type: 'IndexRangeAccess',
            base: (this as any).visit(ctx.getChild(0)),
            indexStart: (this as any).visit(ctx.getChild(2)),
            indexEnd: (this as any).visit(ctx.getChild(4)),
          }
        }
        break
    }

    throw new Error('Unrecognized expression')
  },

  NameValueList(ctx: Ctx) {
    const names = []
    const args = []

    for (const nameValue of ctx.nameValue()) {
      names.push(toText(nameValue.identifier()))
      args.push((this as any).visit(nameValue.expression()))
    }

    return {
      type: 'NameValueList',
      names,
      arguments: args,
    }
  },

  StateVariableDeclaration(ctx: Ctx) {
    const type = (this as any).visit(ctx.typeName())
    const iden = ctx.identifier()
    const name = toText(iden)

    let expression = null
    if (ctx.expression()) {
      expression = (this as any).visit(ctx.expression())
    }

    let visibility = 'default'
    if (ctx.InternalKeyword(0)) {
      visibility = 'internal'
    } else if (ctx.PublicKeyword(0)) {
      visibility = 'public'
    } else if (ctx.PrivateKeyword(0)) {
      visibility = 'private'
    }

    let isDeclaredConst = false
    if (ctx.ConstantKeyword(0)) {
      isDeclaredConst = true
    }

    let override
    const overrideSpecifier = ctx.overrideSpecifier()
    if (overrideSpecifier.length === 0) {
      override = null
    } else {
      override = (this as any).visit(overrideSpecifier[0].userDefinedTypeName())
    }

    let isImmutable = false
    if (ctx.ImmutableKeyword(0)) {
      isImmutable = true
    }

    const decl = (this as any).createNode(
      {
        type: 'VariableDeclaration',
        typeName: type,
        name,
        expression,
        visibility,
        isStateVar: true,
        isDeclaredConst,
        isIndexed: false,
        isImmutable,
        override,
      },
      iden
    )

    return {
      variables: [decl],
      initialValue: expression,
    }
  },

  FileLevelConstant(ctx: Ctx) {
    const type = (this as any).visit(ctx.typeName())
    const iden = ctx.identifier()
    const name = toText(iden)

    let expression = null
    if (ctx.expression()) {
      expression = (this as any).visit(ctx.expression())
    }

    return {
      typeName: type,
      name,
      initialValue: expression,
    }
  },

  ForStatement(ctx: Ctx) {
    let conditionExpression = (this as any).visit(ctx.expressionStatement())
    if (conditionExpression) {
      conditionExpression = conditionExpression.expression
    }
    return {
      initExpression: (this as any).visit(ctx.simpleStatement()),
      conditionExpression,
      loopExpression: {
        type: 'ExpressionStatement',
        expression: (this as any).visit(ctx.expression()),
      },
      body: (this as any).visit(ctx.statement()),
    }
  },

  HexLiteral(ctx: Ctx) {
    const parts = ctx
      .HexLiteralFragment()
      .map(toText)
      .map((x: any) => x.substring(4, x.length - 1))

    return {
      type: 'HexLiteral',
      value: parts.join(''),
      parts,
    }
  },

  PrimaryExpression(ctx: Ctx) {
    if (ctx.BooleanLiteral()) {
      return {
        type: 'BooleanLiteral',
        value: toText(ctx.BooleanLiteral()) === 'true',
      }
    }

    if (ctx.hexLiteral()) {
      return (this as any).visit(ctx.hexLiteral())
    }

    if (ctx.stringLiteral()) {
      const parts = ctx
        .stringLiteral()
        .StringLiteralFragment()
        .map((stringLiteralFragmentCtx: any) => {
          const text = toText(stringLiteralFragmentCtx)
          const singleQuotes = text[0] === "'"
          const textWithoutQuotes = text.substring(1, text.length - 1)
          const value = singleQuotes
            ? textWithoutQuotes.replace(new RegExp("\\\\'", 'g'), "'")
            : textWithoutQuotes.replace(new RegExp('\\\\"', 'g'), '"')

          return value
        })

      return {
        type: 'StringLiteral',
        value: parts.join(''),
        parts,
      }
    }

    if (ctx.TypeKeyword()) {
      return {
        type: 'Identifier',
        name: 'type',
      }
    }

    if (
      ctx.children.length == 3 &&
      toText(ctx.getChild(1)) === '[' &&
      toText(ctx.getChild(2)) === ']'
    ) {
      let node = (this as any).visit(ctx.getChild(0))
      if (node.type === 'Identifier') {
        node = {
          type: 'UserDefinedTypeName',
          namePath: node.name,
        }
      } else if (node.type == 'TypeNameExpression') {
        node = node.typeName
      } else {
        node = {
          type: 'ElementaryTypeName',
          name: toText(ctx.getChild(0)),
        }
      }

      const typeName = {
        type: 'ArrayTypeName',
        baseTypeName: node,
        length: null,
      }

      return {
        type: 'TypeNameExpression',
        typeName,
      }
    }

    return (this as any).visit(ctx.getChild(0))
  },

  Identifier(ctx: Ctx) {
    return {
      name: toText(ctx),
    }
  },

  TupleExpression(ctx: Ctx) {
    // remove parentheses
    const children = ctx.children.slice(1, -1)
    const components = mapCommasToNulls(children).map((expr) => {
      // add a null for each empty value
      if (!expr) {
        return null
      }
      return (this as any).visit(expr)
    })

    return {
      components,
      isArray: toText(ctx.getChild(0)) === '[',
    }
  },

  IdentifierList(ctx: Ctx) {
    // remove parentheses
    const children = ctx.children.slice(1, -1)
    return mapCommasToNulls(children).map((iden) => {
      // add a null for each empty value
      if (!iden) {
        return null
      }

      return (this as any).createNode(
        {
          type: 'VariableDeclaration',
          name: toText(iden),
          storageLocation: null,
          typeName: null,
          isStateVar: false,
          isIndexed: false,
        },
        iden
      )
    })
  },

  VariableDeclarationList(ctx: Ctx) {
    // remove parentheses
    return mapCommasToNulls(ctx.children).map((decl) => {
      // add a null for each empty value
      if (!decl) {
        return null
      }

      let storageLocation = null
      if (decl.storageLocation()) {
        storageLocation = toText(decl.storageLocation())
      }

      return (this as any).createNode(
        {
          type: 'VariableDeclaration',
          name: toText(decl.identifier()),
          typeName: (this as any).visit(decl.typeName()),
          storageLocation,
          isStateVar: false,
          isIndexed: false,
        },
        decl
      )
    })
  },

  VariableDeclarationStatement(ctx: Ctx) {
    let variables
    if (ctx.variableDeclaration()) {
      variables = [(this as any).visit(ctx.variableDeclaration())]
    } else if (ctx.identifierList()) {
      variables = (this as any).visit(ctx.identifierList())
    } else if (ctx.variableDeclarationList()) {
      variables = (this as any).visit(ctx.variableDeclarationList())
    }

    let initialValue = null
    if (ctx.expression()) {
      initialValue = (this as any).visit(ctx.expression())
    }

    return {
      variables,
      initialValue,
    }
  },

  ImportDirective(ctx: Ctx) {
    const pathString = toText(ctx.StringLiteralFragment())
    let unitAlias = null
    let symbolAliases = null

    if (ctx.importDeclaration().length > 0) {
      symbolAliases = ctx.importDeclaration().map((decl: any) => {
        const symbol = toText(decl.identifier(0))
        let alias = null
        if (decl.identifier(1)) {
          alias = toText(decl.identifier(1))
        }
        return [symbol, alias]
      })
    } else if (ctx.children.length === 7) {
      unitAlias = toText(ctx.getChild(3))
    } else if (ctx.children.length === 5) {
      unitAlias = toText(ctx.getChild(3))
    }

    return {
      path: pathString.substring(1, pathString.length - 1),
      unitAlias,
      symbolAliases,
    }
  },

  EventDefinition(ctx: Ctx) {
    return {
      name: toText(ctx.identifier()),
      parameters: (this as any).visit(ctx.eventParameterList()),
      isAnonymous: !!ctx.AnonymousKeyword(),
    }
  },

  EventParameterList(ctx: Ctx) {
    return ctx.eventParameter().map((paramCtx: any) => {
      const type = (this as any).visit(paramCtx.typeName())
      let name = null
      if (paramCtx.identifier()) {
        name = toText(paramCtx.identifier())
      }

      return (this as any).createNode(
        {
          type: 'VariableDeclaration',
          typeName: type,
          name,
          isStateVar: false,
          isIndexed: !!paramCtx.IndexedKeyword(0),
        },
        paramCtx
      )
    }, this)
  },

  ReturnParameters(ctx: Ctx) {
    return (this as any).visit(ctx.parameterList())
  },

  ParameterList(ctx: Ctx) {
    return ctx.parameter().map((paramCtx: any) => (this as any).visit(paramCtx))
  },

  Parameter(ctx: Ctx) {
    let storageLocation = null
    if (ctx.storageLocation()) {
      storageLocation = toText(ctx.storageLocation())
    }

    let name = null
    if (ctx.identifier()) {
      name = toText(ctx.identifier())
    }

    return {
      type: 'VariableDeclaration',
      typeName: (this as any).visit(ctx.typeName()),
      name,
      storageLocation,
      isStateVar: false,
      isIndexed: false,
    }
  },

  InlineAssemblyStatement(ctx: Ctx) {
    let language = null
    if (ctx.StringLiteralFragment()) {
      language = toText(ctx.StringLiteralFragment())
      language = language.substring(1, language.length - 1)
    }

    return {
      language,
      body: (this as any).visit(ctx.assemblyBlock()),
    }
  },

  AssemblyBlock(ctx: Ctx) {
    const operations = ctx
      .assemblyItem()
      .map((it: any) => (this as any).visit(it))

    return { operations }
  },

  AssemblyItem(ctx: Ctx) {
    let text

    if (ctx.hexLiteral()) {
      return (this as any).visit(ctx.hexLiteral())
    }

    if (ctx.stringLiteral()) {
      text = toText(ctx.stringLiteral())
      const value = text.substring(1, text.length - 1)
      return {
        type: 'StringLiteral',
        value,
        parts: [value],
      }
    }

    if (ctx.BreakKeyword()) {
      return {
        type: 'Break',
      }
    }

    if (ctx.ContinueKeyword()) {
      return {
        type: 'Continue',
      }
    }

    return (this as any).visit(ctx.getChild(0))
  },

  AssemblyExpression(ctx: Ctx) {
    return (this as any).visit(ctx.getChild(0))
  },

  AssemblyCall(ctx: Ctx) {
    const functionName = toText(ctx.getChild(0))
    const args = ctx
      .assemblyExpression()
      .map((arg: any) => (this as any).visit(arg))

    return {
      functionName,
      arguments: args,
    }
  },

  AssemblyLiteral(ctx: Ctx) {
    let text

    if (ctx.stringLiteral()) {
      text = toText(ctx)
      const value = text.substring(1, text.length - 1)
      return {
        type: 'StringLiteral',
        value,
        parts: [value],
      }
    }

    if (ctx.DecimalNumber()) {
      return {
        type: 'DecimalNumber',
        value: toText(ctx),
      }
    }

    if (ctx.HexNumber()) {
      return {
        type: 'HexNumber',
        value: toText(ctx),
      }
    }

    if (ctx.hexLiteral()) {
      return (this as any).visit(ctx.hexLiteral())
    }
  },

  AssemblySwitch(ctx: Ctx) {
    return {
      expression: (this as any).visit(ctx.assemblyExpression()),
      cases: ctx.assemblyCase().map((c: any) => (this as any).visit(c)),
    }
  },

  AssemblyCase(ctx: Ctx) {
    let value = null
    if (toText(ctx.getChild(0)) === 'case') {
      value = (this as any).visit(ctx.assemblyLiteral())
    }

    const node: any = { block: (this as any).visit(ctx.assemblyBlock()) }
    if (value) {
      node.value = value
    } else {
      node.default = true
    }

    return node
  },

  AssemblyLocalDefinition(ctx: Ctx) {
    let names = ctx.assemblyIdentifierOrList()
    if (names.identifier()) {
      names = [(this as any).visit(names.identifier())]
    } else if (names.assemblyMember()) {
      names = [(this as any).visit(names.assemblyMember())]
    } else {
      names = (this as any).visit(names.assemblyIdentifierList().identifier())
    }

    return {
      names,
      expression: (this as any).visit(ctx.assemblyExpression()),
    }
  },

  AssemblyFunctionDefinition(ctx: Ctx) {
    let args = ctx.assemblyIdentifierList()
    args = args ? (this as any).visit(args.identifier()) : []

    let returnArgs = ctx.assemblyFunctionReturns()
    returnArgs = returnArgs
      ? (this as any).visit(returnArgs.assemblyIdentifierList().identifier())
      : []

    return {
      name: toText(ctx.identifier()),
      arguments: args,
      returnArguments: returnArgs,
      body: (this as any).visit(ctx.assemblyBlock()),
    }
  },

  AssemblyAssignment(ctx: Ctx) {
    let names = ctx.assemblyIdentifierOrList()
    if (names.identifier()) {
      names = [(this as any).visit(names.identifier())]
    } else if (names.assemblyMember()) {
      names = [(this as any).visit(names.assemblyMember())]
    } else {
      names = (this as any).visit(names.assemblyIdentifierList().identifier())
    }

    return {
      names,
      expression: (this as any).visit(ctx.assemblyExpression()),
    }
  },

  AssemblyMember(ctx: Ctx) {
    const [accessed, member] = ctx.identifier()
    return {
      type: 'AssemblyMemberAccess',
      expression: (this as any).visit(accessed),
      memberName: (this as any).visit(member),
    }
  },

  LabelDefinition(ctx: Ctx) {
    return {
      name: toText(ctx.identifier()),
    }
  },

  AssemblyStackAssignment(ctx: Ctx) {
    return {
      name: toText(ctx.identifier()),
    }
  },

  AssemblyFor(ctx: Ctx) {
    return {
      pre: (this as any).visit(ctx.getChild(1)),
      condition: (this as any).visit(ctx.getChild(2)),
      post: (this as any).visit(ctx.getChild(3)),
      body: (this as any).visit(ctx.getChild(4)),
    }
  },

  AssemblyIf(ctx: Ctx) {
    return {
      condition: (this as any).visit(ctx.assemblyExpression()),
      body: (this as any).visit(ctx.assemblyBlock()),
    }
  },
}

class ASTBuilder extends antlr4.tree.ParseTreeVisitor {
  public options: ParseOptions

  constructor(options: ParseOptions) {
    super(options)

    this.options = options
  }

  _loc(ctx: Ctx) {
    const sourceLocation = {
      start: {
        line: ctx.start.line,
        column: ctx.start.column,
      },
      end: {
        line: ctx.stop ? ctx.stop.line : ctx.start.line,
        column: ctx.stop ? ctx.stop.column : ctx.start.column,
      },
    }
    return { loc: sourceLocation }
  }

  _range(ctx: Ctx) {
    return { range: [ctx.start.start, ctx.stop.stop] }
  }

  meta(ctx: Ctx) {
    const ret: any = {}
    if (this.options.loc === true) {
      Object.assign(ret, this._loc(ctx))
    }
    if (this.options.range === true) {
      Object.assign(ret, this._range(ctx))
    }
    return ret
  }

  createNode(obj: any, ctx: any) {
    return Object.assign(obj, this.meta(ctx))
  }

  visit(ctx: Ctx): BaseASTNode | BaseASTNode[] | null {
    if (!ctx) {
      return null
    }

    if (Array.isArray(ctx)) {
      return ctx.map((child) => {
        return (this as any).visit(child)
      }, this)
    }

    let name: string = ctx.constructor.name
    if (name.endsWith('Context')) {
      name = name.substring(0, name.length - 'Context'.length)
    }

    const node = { type: name }

    if (name in transformAST) {
      const visited = (transformAST as any)[name].call(this, ctx)
      if (Array.isArray(visited)) {
        return visited
      }
      Object.assign(node, visited)
    }

    return (this as any).createNode(node, ctx)
  }
}

export default ASTBuilder
