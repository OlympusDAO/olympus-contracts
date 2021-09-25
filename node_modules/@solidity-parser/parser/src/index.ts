import SolidityLexer from './lib/SolidityLexer'
import SolidityParser from './lib/SolidityParser'
import { Token, ParseOptions, TokenizeOptions } from './types'
import { AST, BaseASTNode } from './ast-types'

import antlr4 from 'antlr4'
import { buildTokenList } from './tokens'
import ASTBuilder from './ASTBuilder'
import ErrorListener from './ErrorListener'

interface ParserErrorItem {
  message: string
  line: number
  column: number
}
export class ParserError extends Error {
  public errors: ParserErrorItem[]

  constructor(args: { errors: ParserErrorItem[] }) {
    super()
    const { message, line, column } = args.errors[0]
    this.message = `${message} (${line}:${column})`
    this.errors = args.errors

    if (Error.captureStackTrace !== undefined) {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error().stack
    }
  }
}

export function tokenize(
  input: string,
  options: TokenizeOptions = {}
): Token[] {
  const chars = new antlr4.InputStream(input)
  const lexer = new SolidityLexer(chars)
  const tokens = new antlr4.CommonTokenStream(lexer)

  return buildTokenList(tokens.tokenSource.getAllTokens(), options)
}

export function parse(input: string, options: ParseOptions = {}): AST {
  const chars = new antlr4.InputStream(input)

  const listener = new ErrorListener()

  const lexer: any = new SolidityLexer(chars)
  lexer.removeErrorListeners()
  lexer.addErrorListener(listener)

  const tokens = new antlr4.CommonTokenStream(lexer)

  const parser: any = new SolidityParser(tokens)

  parser.removeErrorListeners()
  parser.addErrorListener(listener)
  parser.buildParseTrees = true

  const tree = parser.sourceUnit()

  let tokenList: Token[] = []
  if (options.tokens === true) {
    const tokenSource = tokens.tokenSource
    tokenSource.reset()

    tokenList = buildTokenList(tokenSource.getAllTokens(), options)
  }

  if (options.tolerant !== true && listener.hasErrors()) {
    throw new ParserError({ errors: listener.getErrors() })
  }

  const visitor = new ASTBuilder(options)
  const ast = visitor.visit(tree) as AST

  if (options.tolerant === true && listener.hasErrors()) {
    ast.errors = listener.getErrors()
  }
  if (options.tokens === true) {
    ast.tokens = tokenList
  }

  return ast
}

function _isASTNode(node: any): node is BaseASTNode {
  return (
    node !== null &&
    typeof node === 'object' &&
    Object.prototype.hasOwnProperty.call(node, 'type')
  )
}

export function visit(node: any, visitor: any): void {
  if (Array.isArray(node)) {
    node.forEach((child) => visit(child, visitor))
  }

  if (!_isASTNode(node)) return

  let cont = true

  if (visitor[node.type] !== undefined) {
    cont = visitor[node.type](node)
  }

  if (cont === false) return

  for (const prop in node) {
    if (Object.prototype.hasOwnProperty.call(node, prop)) {
      visit((node as any)[prop], visitor)
    }
  }

  const selector = node.type + ':exit'
  if (visitor[selector] !== undefined) {
    visitor[selector](node)
  }
}
