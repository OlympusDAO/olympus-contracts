// Base on the original type definitions for solidity-parser-antlr 0.2
// by Leonid Logvinov <https://github.com/LogvinovLeon>
//    Alex Browne <https://github.com/albrow>
//    Xiao Liang <https://github.com/yxliang01>

import { Token } from './types'

export type AST = {
  errors?: any[]
  tokens?: Token[]
} & ASTNode

export interface BaseASTNode {
  type: ASTNodeTypeString
  range?: [number, number]
  loc?: Location
}

export type ASTNodeTypeString =
  | 'SourceUnit'
  | 'PragmaDirective'
  | 'PragmaName'
  | 'PragmaValue'
  | 'ImportDirective'
  | 'ContractDefinition'
  | 'InheritanceSpecifier'
  | 'StateVariableDeclaration'
  | 'UsingForDeclaration'
  | 'StructDefinition'
  | 'ModifierDefinition'
  | 'ModifierInvocation'
  | 'FunctionDefinition'
  | 'EventDefinition'
  | 'EnumValue'
  | 'EnumDefinition'
  | 'VariableDeclaration'
  | 'UserDefinedTypeName'
  | 'Mapping'
  | 'ArrayTypeName'
  | 'FunctionTypeName'
  | 'StorageLocation'
  | 'StateMutability'
  | 'Block'
  | 'ExpressionStatement'
  | 'IfStatement'
  | 'WhileStatement'
  | 'ForStatement'
  | 'InlineAssemblyStatement'
  | 'DoWhileStatement'
  | 'ContinueStatement'
  | 'Break'
  | 'Continue'
  | 'BreakStatement'
  | 'ReturnStatement'
  | 'EmitStatement'
  | 'ThrowStatement'
  | 'VariableDeclarationStatement'
  | 'IdentifierList'
  | 'ElementaryTypeName'
  | 'FunctionCall'
  | 'AssemblyBlock'
  | 'AssemblyItem'
  | 'AssemblyCall'
  | 'AssemblyLocalDefinition'
  | 'AssemblyAssignment'
  | 'AssemblyStackAssignment'
  | 'LabelDefinition'
  | 'AssemblySwitch'
  | 'AssemblyCase'
  | 'AssemblyFunctionDefinition'
  | 'AssemblyFunctionReturns'
  | 'AssemblyFor'
  | 'AssemblyIf'
  | 'AssemblyLiteral'
  | 'SubAssembly'
  | 'TupleExpression'
  | 'TypeNameExpression'
  | 'NameValueExpression'
  | 'BooleanLiteral'
  | 'NumberLiteral'
  | 'Identifier'
  | 'BinaryOperation'
  | 'UnaryOperation'
  | 'NewExpression'
  | 'Conditional'
  | 'StringLiteral'
  | 'HexLiteral'
  | 'HexNumber'
  | 'DecimalNumber'
  | 'MemberAccess'
  | 'IndexAccess'
  | 'IndexRangeAccess'
  | 'NameValueList'
  | 'UncheckedStatement'
export interface BaseASTNode {
  type: ASTNodeTypeString
  range?: [number, number]
  loc?: Location
}
export interface SourceUnit extends BaseASTNode {
  type: 'SourceUnit'
  children: ASTNode[] // TODO: Can be more precise
} // tslint:disable-line:no-empty-interface
export interface PragmaDirective extends BaseASTNode {
  type: 'PragmaDirective'
  name: string
  value: string
}
export interface ImportDirective extends BaseASTNode {
  type: 'ImportDirective'
  path: string
  unitAlias: string
  symbolAliases: Array<[string, string]>
}
export interface ContractDefinition extends BaseASTNode {
  type: 'ContractDefinition'
  name: string
  baseContracts: InheritanceSpecifier[]
  kind: string
  subNodes: ASTNode[] // TODO: Can be more precise
}
export interface InheritanceSpecifier extends BaseASTNode {
  type: 'InheritanceSpecifier'
  baseName: UserDefinedTypeName
  arguments: Expression[]
}
export interface StateVariableDeclaration extends BaseASTNode {
  type: 'StateVariableDeclaration'
  variables: StateVariableDeclarationVariable[]
  initialValue?: Expression
}
export interface UsingForDeclaration extends BaseASTNode {
  type: 'UsingForDeclaration'
  typeName: TypeName
  libraryName: string
}
export interface StructDefinition extends BaseASTNode {
  type: 'StructDefinition'
  name: string
  members: VariableDeclaration[]
}
export interface ModifierDefinition extends BaseASTNode {
  type: 'ModifierDefinition'
  name: string
  parameters: null | VariableDeclaration[]
  isVirtual: boolean
  override: null | UserDefinedTypeName[]
  body: Block
}
export interface ModifierInvocation extends BaseASTNode {
  type: 'ModifierInvocation'
  name: string
  arguments: Expression[] | null
}
export interface FunctionDefinition extends BaseASTNode {
  type: 'FunctionDefinition'
  name?: string
  parameters: VariableDeclaration[]
  modifiers: ModifierInvocation[]
  stateMutability?: 'pure' | 'constant' | 'payable' | 'view'
  visibility: 'default' | 'external' | 'internal' | 'public' | 'private'
  returnParameters?: VariableDeclaration[]
  body?: Block
  override: null | UserDefinedTypeName[]
  isConstructor: boolean
  isReceiveEther: boolean
  isFallback: boolean
  isVirtual: boolean
}
export interface EventDefinition extends BaseASTNode {
  type: 'EventDefinition'
  name: string
  parameters: VariableDeclaration[]
}
export interface EnumValue extends BaseASTNode {
  type: 'EnumValue'
  name: string
}
export interface EnumDefinition extends BaseASTNode {
  type: 'EnumDefinition'
  name: string
  members: EnumValue[]
}
export interface VariableDeclaration extends BaseASTNode {
  type: 'VariableDeclaration'
  isIndexed: boolean
  isStateVar: boolean
  typeName: TypeName
  name: string
  isDeclaredConst?: boolean
  storageLocation?: string
  expression?: Expression
  visibility?: 'public' | 'private' | 'internal' | 'default'
}
export interface StateVariableDeclarationVariable extends VariableDeclaration {
  override: null | UserDefinedTypeName[]
  isImmutable: boolean
}
export interface UserDefinedTypeName extends BaseASTNode {
  type: 'UserDefinedTypeName'
  namePath: string
}
export interface ArrayTypeName extends BaseASTNode {
  type: 'ArrayTypeName'
  baseTypeName: TypeName
  length: Expression | null
}
export interface Mapping extends BaseASTNode {
  type: 'Mapping'
  keyType: ElementaryTypeName
  valueType: TypeName
}
export interface FunctionTypeName extends BaseASTNode {
  type: 'FunctionTypeName'
  parameterTypes: TypeName[]
  returnTypes: TypeName[]
  visibility: string
  stateMutability: string
}
export interface Block extends BaseASTNode {
  type: 'Block'
  statements: Statement[]
}
export interface ExpressionStatement extends BaseASTNode {
  type: 'ExpressionStatement'
  expression: Expression
}
export interface IfStatement extends BaseASTNode {
  type: 'IfStatement'
  condition: Expression
  trueBody: Statement
  falseBody?: Statement
}
export interface UncheckedStatement extends BaseASTNode {
  type: 'UncheckedStatement'
  block: Block
}
export interface WhileStatement extends BaseASTNode {
  type: 'WhileStatement'
  body: Statement
}
export interface ForStatement extends BaseASTNode {
  type: 'ForStatement'
  initExpression?: SimpleStatement
  conditionExpression?: Expression
  loopExpression?: ExpressionStatement
  body: Statement
}
export interface InlineAssemblyStatement extends BaseASTNode {
  type: 'InlineAssemblyStatement'
  language: string
  body: AssemblyBlock
}
export interface DoWhileStatement extends BaseASTNode {
  type: 'DoWhileStatement'
  condition: Expression
  body: Statement
}
export interface ContinueStatement extends BaseASTNode {
  type: 'ContinueStatement'
}
export interface Break extends BaseASTNode {
  type: 'Break'
}
export interface Continue extends BaseASTNode {
  type: 'Continue'
}
export interface BreakStatement extends BaseASTNode {
  type: 'BreakStatement'
}
export interface ReturnStatement extends BaseASTNode {
  type: 'ReturnStatement'
  expression: Expression | null
}
export interface EmitStatement extends BaseASTNode {
  type: 'EmitStatement'
  eventCall: FunctionCall
}
export interface ThrowStatement extends BaseASTNode {
  type: 'ThrowStatement'
}
export interface VariableDeclarationStatement extends BaseASTNode {
  type: 'VariableDeclarationStatement'
  variables: ASTNode[]
  initialValue?: Expression
}
export interface ElementaryTypeName extends BaseASTNode {
  type: 'ElementaryTypeName'
  name: string
}
export interface FunctionCall extends BaseASTNode {
  type: 'FunctionCall'
  expression: Expression
  arguments: Expression[]
  names: string[]
}
export interface AssemblyBlock extends BaseASTNode {
  type: 'AssemblyBlock'
  operations: AssemblyItem[]
}
export interface AssemblyCall extends BaseASTNode {
  type: 'AssemblyCall'
  functionName: string
  arguments: AssemblyExpression[]
}
export interface AssemblyLocalDefinition extends BaseASTNode {
  type: 'AssemblyLocalDefinition'
}
export interface AssemblyAssignment extends BaseASTNode {
  type: 'AssemblyAssignment'
  expression: AssemblyExpression
  names: Identifier[]
}
export interface AssemblyStackAssignment extends BaseASTNode {
  type: 'AssemblyStackAssignment'
}
export interface LabelDefinition extends BaseASTNode {
  type: 'LabelDefinition'
}
export interface AssemblySwitch extends BaseASTNode {
  type: 'AssemblySwitch'
}
export interface AssemblyCase extends BaseASTNode {
  type: 'AssemblyCase'
}
export interface AssemblyFunctionDefinition extends BaseASTNode {
  type: 'AssemblyFunctionDefinition'
}
export interface AssemblyFunctionReturns extends BaseASTNode {
  type: 'AssemblyFunctionReturns'
}
export interface AssemblyFor extends BaseASTNode {
  type: 'AssemblyFor'
}
export interface AssemblyIf extends BaseASTNode {
  type: 'AssemblyIf'
}
export interface AssemblyLiteral extends BaseASTNode {
  type: 'AssemblyLiteral'
}
export interface SubAssembly extends BaseASTNode {
  type: 'SubAssembly'
}
export interface NewExpression extends BaseASTNode {
  type: 'NewExpression'
  typeName: TypeName
}
export interface TupleExpression extends BaseASTNode {
  type: 'TupleExpression'
  components: Expression[]
  isArray: boolean
}
export interface TypeNameExpression extends BaseASTNode {
  type: 'TypeNameExpression'
  typeName: ElementaryTypeName | UserDefinedTypeName | ArrayTypeName
}
export interface NameValueExpression extends BaseASTNode {
  type: 'NameValueExpression'
  expression: Expression
  arguments: { [name: string]: Expression }
}
export interface NumberLiteral extends BaseASTNode {
  type: 'NumberLiteral'
  number: string
  subdenomination:
    | null
    | 'wei'
    | 'szabo'
    | 'finney'
    | 'ether'
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'weeks'
    | 'years'
}
export interface BooleanLiteral extends BaseASTNode {
  type: 'BooleanLiteral'
  value: boolean
}
export interface HexLiteral extends BaseASTNode {
  type: 'HexLiteral'
  value: string
  parts: string[]
}
export interface StringLiteral extends BaseASTNode {
  type: 'StringLiteral'
  value: string
  parts: string[]
}
export interface Identifier extends BaseASTNode {
  type: 'Identifier'
  name: string
}
export type BinOp =
  | '+'
  | '-'
  | '*'
  | '/'
  | '**'
  | '%'
  | '<<'
  | '>>'
  | '&&'
  | '||'
  | '&'
  | '|'
  | '^'
  | '<'
  | '>'
  | '<='
  | '>='
  | '=='
  | '!='
  | '='
  | '|='
  | '^='
  | '&='
  | '<<='
  | '>>='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='
export type UnaryOp = '-' | '+' | '++' | '~' | 'after' | 'delete' | '!'
export interface BinaryOperation extends BaseASTNode {
  type: 'BinaryOperation'
  left: Expression
  right: Expression
  operator: BinOp
}
export interface UnaryOperation extends BaseASTNode {
  type: 'UnaryOperation'
  operator: UnaryOp
  subExpression: Expression
  isPrefix: boolean
}
export interface Conditional extends BaseASTNode {
  type: 'Conditional'
  condition: Expression
  trueExpression: ASTNode
  falseExpression: ASTNode
}
export interface IndexAccess extends BaseASTNode {
  type: 'IndexAccess'
  base: Expression
  index: Expression
}
export interface IndexRangeAccess extends BaseASTNode {
  type: 'IndexRangeAccess'
  base: Expression
  indexStart?: Expression
  indexEnd?: Expression
}
export interface MemberAccess extends BaseASTNode {
  type: 'MemberAccess'
  expression: Expression
  memberName: string
}
export interface HexNumber extends BaseASTNode {
  type: 'HexNumber'
  value: string
}
export interface DecimalNumber extends BaseASTNode {
  type: 'DecimalNumber'
  value: string
}
export interface NameValueList extends BaseASTNode {
  type: 'NameValueList'
  names: string[]
  args: Expression[]
}
export type ASTNode =
  | SourceUnit
  | PragmaDirective
  | ImportDirective
  | ContractDefinition
  | InheritanceSpecifier
  | StateVariableDeclaration
  | UsingForDeclaration
  | StructDefinition
  | ModifierDefinition
  | ModifierInvocation
  | FunctionDefinition
  | EventDefinition
  | EnumValue
  | EnumDefinition
  | VariableDeclaration
  | TypeName
  | UserDefinedTypeName
  | Mapping
  | FunctionTypeName
  | Block
  | Statement
  | ElementaryTypeName
  | AssemblyBlock
  | AssemblyCall
  | AssemblyLocalDefinition
  | AssemblyAssignment
  | AssemblyStackAssignment
  | LabelDefinition
  | AssemblySwitch
  | AssemblyCase
  | AssemblyFunctionDefinition
  | AssemblyFunctionReturns
  | AssemblyFor
  | AssemblyIf
  | AssemblyLiteral
  | SubAssembly
  | TupleExpression
  | TypeNameExpression
  | BinaryOperation
  | Conditional
  | IndexAccess
  | IndexRangeAccess
  | AssemblyItem
  | Expression
export type AssemblyItem =
  | Identifier
  | AssemblyBlock
  | AssemblyExpression
  | AssemblyLocalDefinition
  | AssemblyAssignment
  | AssemblyStackAssignment
  | LabelDefinition
  | AssemblySwitch
  | AssemblyFunctionDefinition
  | AssemblyFor
  | AssemblyIf
  | Break
  | Continue
  | SubAssembly
  | NumberLiteral
  | StringLiteral
  | HexNumber
  | HexLiteral
  | DecimalNumber
export type AssemblyExpression = AssemblyCall | AssemblyLiteral
export type Expression =
  | IndexAccess
  | IndexRangeAccess
  | TupleExpression
  | BinaryOperation
  | Conditional
  | MemberAccess
  | FunctionCall
  | UnaryOperation
  | NewExpression
  | PrimaryExpression
  | NameValueExpression
export type PrimaryExpression =
  | BooleanLiteral
  | NumberLiteral
  | Identifier
  | TupleExpression
  | TypeNameExpression
export type SimpleStatement = VariableDeclarationStatement | ExpressionStatement
export type TypeName =
  | ElementaryTypeName
  | UserDefinedTypeName
  | Mapping
  | ArrayTypeName
  | FunctionTypeName
export type Statement =
  | IfStatement
  | WhileStatement
  | ForStatement
  | Block
  | InlineAssemblyStatement
  | DoWhileStatement
  | ContinueStatement
  | BreakStatement
  | ReturnStatement
  | EmitStatement
  | ThrowStatement
  | SimpleStatement
  | VariableDeclarationStatement
  | UncheckedStatement
