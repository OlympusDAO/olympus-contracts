declare const SolidityParser_base: any;
declare class SolidityParser extends SolidityParser_base {
    [x: string]: any;
    static grammarFileName: string;
    static literalNames: (string | null)[];
    static symbolicNames: (string | null)[];
    static ruleNames: string[];
    constructor(input: any);
    _interp: any;
    ruleNames: string[];
    literalNames: (string | null)[];
    symbolicNames: (string | null)[];
    get atn(): any;
    sempred(localctx: any, ruleIndex: any, predIndex: any): any;
    typeName_sempred(localctx: any, predIndex: any): any;
    expression_sempred(localctx: any, predIndex: any): any;
    sourceUnit(): SourceUnitContext;
    state: number | undefined;
    pragmaDirective(): PragmaDirectiveContext;
    pragmaName(): PragmaNameContext;
    pragmaValue(): PragmaValueContext;
    version(): VersionContext;
    versionOperator(): VersionOperatorContext;
    versionConstraint(): VersionConstraintContext;
    importDeclaration(): ImportDeclarationContext;
    importDirective(): ImportDirectiveContext;
    contractDefinition(): ContractDefinitionContext;
    inheritanceSpecifier(): InheritanceSpecifierContext;
    contractPart(): ContractPartContext;
    stateVariableDeclaration(): StateVariableDeclarationContext;
    fileLevelConstant(): FileLevelConstantContext;
    usingForDeclaration(): UsingForDeclarationContext;
    structDefinition(): StructDefinitionContext;
    modifierDefinition(): ModifierDefinitionContext;
    modifierInvocation(): ModifierInvocationContext;
    functionDefinition(): FunctionDefinitionContext;
    functionDescriptor(): FunctionDescriptorContext;
    returnParameters(): ReturnParametersContext;
    modifierList(): ModifierListContext;
    eventDefinition(): EventDefinitionContext;
    enumValue(): EnumValueContext;
    enumDefinition(): EnumDefinitionContext;
    parameterList(): ParameterListContext;
    parameter(): ParameterContext;
    eventParameterList(): EventParameterListContext;
    eventParameter(): EventParameterContext;
    functionTypeParameterList(): FunctionTypeParameterListContext;
    functionTypeParameter(): FunctionTypeParameterContext;
    variableDeclaration(): VariableDeclarationContext;
    typeName(_p: any): TypeNameContext;
    userDefinedTypeName(): UserDefinedTypeNameContext;
    mappingKey(): MappingKeyContext;
    mapping(): MappingContext;
    functionTypeName(): FunctionTypeNameContext;
    storageLocation(): StorageLocationContext;
    stateMutability(): StateMutabilityContext;
    block(): BlockContext;
    statement(): StatementContext;
    expressionStatement(): ExpressionStatementContext;
    ifStatement(): IfStatementContext;
    tryStatement(): TryStatementContext;
    catchClause(): CatchClauseContext;
    whileStatement(): WhileStatementContext;
    simpleStatement(): SimpleStatementContext;
    uncheckedStatement(): UncheckedStatementContext;
    forStatement(): ForStatementContext;
    inlineAssemblyStatement(): InlineAssemblyStatementContext;
    doWhileStatement(): DoWhileStatementContext;
    continueStatement(): ContinueStatementContext;
    breakStatement(): BreakStatementContext;
    returnStatement(): ReturnStatementContext;
    throwStatement(): ThrowStatementContext;
    emitStatement(): EmitStatementContext;
    variableDeclarationStatement(): VariableDeclarationStatementContext;
    variableDeclarationList(): VariableDeclarationListContext;
    identifierList(): IdentifierListContext;
    elementaryTypeName(): ElementaryTypeNameContext;
    expression(_p: any): ExpressionContext;
    primaryExpression(): PrimaryExpressionContext;
    expressionList(): ExpressionListContext;
    nameValueList(): NameValueListContext;
    nameValue(): NameValueContext;
    functionCallArguments(): FunctionCallArgumentsContext;
    functionCall(): FunctionCallContext;
    assemblyBlock(): AssemblyBlockContext;
    assemblyItem(): AssemblyItemContext;
    assemblyExpression(): AssemblyExpressionContext;
    assemblyMember(): AssemblyMemberContext;
    assemblyCall(): AssemblyCallContext;
    assemblyLocalDefinition(): AssemblyLocalDefinitionContext;
    assemblyAssignment(): AssemblyAssignmentContext;
    assemblyIdentifierOrList(): AssemblyIdentifierOrListContext;
    assemblyIdentifierList(): AssemblyIdentifierListContext;
    assemblyStackAssignment(): AssemblyStackAssignmentContext;
    labelDefinition(): LabelDefinitionContext;
    assemblySwitch(): AssemblySwitchContext;
    assemblyCase(): AssemblyCaseContext;
    assemblyFunctionDefinition(): AssemblyFunctionDefinitionContext;
    assemblyFunctionReturns(): AssemblyFunctionReturnsContext;
    assemblyFor(): AssemblyForContext;
    assemblyIf(): AssemblyIfContext;
    assemblyLiteral(): AssemblyLiteralContext;
    subAssembly(): SubAssemblyContext;
    tupleExpression(): TupleExpressionContext;
    typeNameExpression(): TypeNameExpressionContext;
    numberLiteral(): NumberLiteralContext;
    identifier(): IdentifierContext;
    hexLiteral(): HexLiteralContext;
    overrideSpecifier(): OverrideSpecifierContext;
    stringLiteral(): StringLiteralContext;
}
declare namespace SolidityParser {
    export const EOF: any;
    export const T__0: number;
    export const T__1: number;
    export const T__2: number;
    export const T__3: number;
    export const T__4: number;
    export const T__5: number;
    export const T__6: number;
    export const T__7: number;
    export const T__8: number;
    export const T__9: number;
    export const T__10: number;
    export const T__11: number;
    export const T__12: number;
    export const T__13: number;
    export const T__14: number;
    export const T__15: number;
    export const T__16: number;
    export const T__17: number;
    export const T__18: number;
    export const T__19: number;
    export const T__20: number;
    export const T__21: number;
    export const T__22: number;
    export const T__23: number;
    export const T__24: number;
    export const T__25: number;
    export const T__26: number;
    export const T__27: number;
    export const T__28: number;
    export const T__29: number;
    export const T__30: number;
    export const T__31: number;
    export const T__32: number;
    export const T__33: number;
    export const T__34: number;
    export const T__35: number;
    export const T__36: number;
    export const T__37: number;
    export const T__38: number;
    export const T__39: number;
    export const T__40: number;
    export const T__41: number;
    export const T__42: number;
    export const T__43: number;
    export const T__44: number;
    export const T__45: number;
    export const T__46: number;
    export const T__47: number;
    export const T__48: number;
    export const T__49: number;
    export const T__50: number;
    export const T__51: number;
    export const T__52: number;
    export const T__53: number;
    export const T__54: number;
    export const T__55: number;
    export const T__56: number;
    export const T__57: number;
    export const T__58: number;
    export const T__59: number;
    export const T__60: number;
    export const T__61: number;
    export const T__62: number;
    export const T__63: number;
    export const T__64: number;
    export const T__65: number;
    export const T__66: number;
    export const T__67: number;
    export const T__68: number;
    export const T__69: number;
    export const T__70: number;
    export const T__71: number;
    export const T__72: number;
    export const T__73: number;
    export const T__74: number;
    export const T__75: number;
    export const T__76: number;
    export const T__77: number;
    export const T__78: number;
    export const T__79: number;
    export const T__80: number;
    export const T__81: number;
    export const T__82: number;
    export const T__83: number;
    export const T__84: number;
    export const T__85: number;
    export const T__86: number;
    export const T__87: number;
    export const T__88: number;
    export const T__89: number;
    export const T__90: number;
    export const T__91: number;
    export const T__92: number;
    export const T__93: number;
    export const T__94: number;
    export const Int: number;
    export const Uint: number;
    export const Byte: number;
    export const Fixed: number;
    export const Ufixed: number;
    export const BooleanLiteral: number;
    export const DecimalNumber: number;
    export const HexNumber: number;
    export const NumberUnit: number;
    export const HexLiteralFragment: number;
    export const ReservedKeyword: number;
    export const AnonymousKeyword: number;
    export const BreakKeyword: number;
    export const ConstantKeyword: number;
    export const ImmutableKeyword: number;
    export const ContinueKeyword: number;
    export const LeaveKeyword: number;
    export const ExternalKeyword: number;
    export const IndexedKeyword: number;
    export const InternalKeyword: number;
    export const PayableKeyword: number;
    export const PrivateKeyword: number;
    export const PublicKeyword: number;
    export const VirtualKeyword: number;
    export const PureKeyword: number;
    export const TypeKeyword: number;
    export const ViewKeyword: number;
    export const ConstructorKeyword: number;
    export const FallbackKeyword: number;
    export const ReceiveKeyword: number;
    export const Identifier: number;
    export const StringLiteralFragment: number;
    export const VersionLiteral: number;
    export const WS: number;
    export const COMMENT: number;
    export const LINE_COMMENT: number;
    export const RULE_sourceUnit: number;
    export const RULE_pragmaDirective: number;
    export const RULE_pragmaName: number;
    export const RULE_pragmaValue: number;
    export const RULE_version: number;
    export const RULE_versionOperator: number;
    export const RULE_versionConstraint: number;
    export const RULE_importDeclaration: number;
    export const RULE_importDirective: number;
    export const RULE_contractDefinition: number;
    export const RULE_inheritanceSpecifier: number;
    export const RULE_contractPart: number;
    export const RULE_stateVariableDeclaration: number;
    export const RULE_fileLevelConstant: number;
    export const RULE_usingForDeclaration: number;
    export const RULE_structDefinition: number;
    export const RULE_modifierDefinition: number;
    export const RULE_modifierInvocation: number;
    export const RULE_functionDefinition: number;
    export const RULE_functionDescriptor: number;
    export const RULE_returnParameters: number;
    export const RULE_modifierList: number;
    export const RULE_eventDefinition: number;
    export const RULE_enumValue: number;
    export const RULE_enumDefinition: number;
    export const RULE_parameterList: number;
    export const RULE_parameter: number;
    export const RULE_eventParameterList: number;
    export const RULE_eventParameter: number;
    export const RULE_functionTypeParameterList: number;
    export const RULE_functionTypeParameter: number;
    export const RULE_variableDeclaration: number;
    export const RULE_typeName: number;
    export const RULE_userDefinedTypeName: number;
    export const RULE_mappingKey: number;
    export const RULE_mapping: number;
    export const RULE_functionTypeName: number;
    export const RULE_storageLocation: number;
    export const RULE_stateMutability: number;
    export const RULE_block: number;
    export const RULE_statement: number;
    export const RULE_expressionStatement: number;
    export const RULE_ifStatement: number;
    export const RULE_tryStatement: number;
    export const RULE_catchClause: number;
    export const RULE_whileStatement: number;
    export const RULE_simpleStatement: number;
    export const RULE_uncheckedStatement: number;
    export const RULE_forStatement: number;
    export const RULE_inlineAssemblyStatement: number;
    export const RULE_doWhileStatement: number;
    export const RULE_continueStatement: number;
    export const RULE_breakStatement: number;
    export const RULE_returnStatement: number;
    export const RULE_throwStatement: number;
    export const RULE_emitStatement: number;
    export const RULE_variableDeclarationStatement: number;
    export const RULE_variableDeclarationList: number;
    export const RULE_identifierList: number;
    export const RULE_elementaryTypeName: number;
    export const RULE_expression: number;
    export const RULE_primaryExpression: number;
    export const RULE_expressionList: number;
    export const RULE_nameValueList: number;
    export const RULE_nameValue: number;
    export const RULE_functionCallArguments: number;
    export const RULE_functionCall: number;
    export const RULE_assemblyBlock: number;
    export const RULE_assemblyItem: number;
    export const RULE_assemblyExpression: number;
    export const RULE_assemblyMember: number;
    export const RULE_assemblyCall: number;
    export const RULE_assemblyLocalDefinition: number;
    export const RULE_assemblyAssignment: number;
    export const RULE_assemblyIdentifierOrList: number;
    export const RULE_assemblyIdentifierList: number;
    export const RULE_assemblyStackAssignment: number;
    export const RULE_labelDefinition: number;
    export const RULE_assemblySwitch: number;
    export const RULE_assemblyCase: number;
    export const RULE_assemblyFunctionDefinition: number;
    export const RULE_assemblyFunctionReturns: number;
    export const RULE_assemblyFor: number;
    export const RULE_assemblyIf: number;
    export const RULE_assemblyLiteral: number;
    export const RULE_subAssembly: number;
    export const RULE_tupleExpression: number;
    export const RULE_typeNameExpression: number;
    export const RULE_numberLiteral: number;
    export const RULE_identifier: number;
    export const RULE_hexLiteral: number;
    export const RULE_overrideSpecifier: number;
    export const RULE_stringLiteral: number;
    export { SourceUnitContext };
    export { PragmaDirectiveContext };
    export { PragmaNameContext };
    export { PragmaValueContext };
    export { VersionContext };
    export { VersionOperatorContext };
    export { VersionConstraintContext };
    export { ImportDeclarationContext };
    export { ImportDirectiveContext };
    export { ContractDefinitionContext };
    export { InheritanceSpecifierContext };
    export { ContractPartContext };
    export { StateVariableDeclarationContext };
    export { FileLevelConstantContext };
    export { UsingForDeclarationContext };
    export { StructDefinitionContext };
    export { ModifierDefinitionContext };
    export { ModifierInvocationContext };
    export { FunctionDefinitionContext };
    export { FunctionDescriptorContext };
    export { ReturnParametersContext };
    export { ModifierListContext };
    export { EventDefinitionContext };
    export { EnumValueContext };
    export { EnumDefinitionContext };
    export { ParameterListContext };
    export { ParameterContext };
    export { EventParameterListContext };
    export { EventParameterContext };
    export { FunctionTypeParameterListContext };
    export { FunctionTypeParameterContext };
    export { VariableDeclarationContext };
    export { TypeNameContext };
    export { UserDefinedTypeNameContext };
    export { MappingKeyContext };
    export { MappingContext };
    export { FunctionTypeNameContext };
    export { StorageLocationContext };
    export { StateMutabilityContext };
    export { BlockContext };
    export { StatementContext };
    export { ExpressionStatementContext };
    export { IfStatementContext };
    export { TryStatementContext };
    export { CatchClauseContext };
    export { WhileStatementContext };
    export { SimpleStatementContext };
    export { UncheckedStatementContext };
    export { ForStatementContext };
    export { InlineAssemblyStatementContext };
    export { DoWhileStatementContext };
    export { ContinueStatementContext };
    export { BreakStatementContext };
    export { ReturnStatementContext };
    export { ThrowStatementContext };
    export { EmitStatementContext };
    export { VariableDeclarationStatementContext };
    export { VariableDeclarationListContext };
    export { IdentifierListContext };
    export { ElementaryTypeNameContext };
    export { ExpressionContext };
    export { PrimaryExpressionContext };
    export { ExpressionListContext };
    export { NameValueListContext };
    export { NameValueContext };
    export { FunctionCallArgumentsContext };
    export { FunctionCallContext };
    export { AssemblyBlockContext };
    export { AssemblyItemContext };
    export { AssemblyExpressionContext };
    export { AssemblyMemberContext };
    export { AssemblyCallContext };
    export { AssemblyLocalDefinitionContext };
    export { AssemblyAssignmentContext };
    export { AssemblyIdentifierOrListContext };
    export { AssemblyIdentifierListContext };
    export { AssemblyStackAssignmentContext };
    export { LabelDefinitionContext };
    export { AssemblySwitchContext };
    export { AssemblyCaseContext };
    export { AssemblyFunctionDefinitionContext };
    export { AssemblyFunctionReturnsContext };
    export { AssemblyForContext };
    export { AssemblyIfContext };
    export { AssemblyLiteralContext };
    export { SubAssemblyContext };
    export { TupleExpressionContext };
    export { TypeNameExpressionContext };
    export { NumberLiteralContext };
    export { IdentifierContext };
    export { HexLiteralContext };
    export { OverrideSpecifierContext };
    export { StringLiteralContext };
}
export default SolidityParser;
declare const SourceUnitContext_base: any;
declare class SourceUnitContext extends SourceUnitContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    EOF(): any;
    pragmaDirective: (i: any) => any;
    importDirective: (i: any) => any;
    contractDefinition: (i: any) => any;
    enumDefinition: (i: any) => any;
    structDefinition: (i: any) => any;
    functionDefinition: (i: any) => any;
    fileLevelConstant: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const PragmaDirectiveContext_base: any;
declare class PragmaDirectiveContext extends PragmaDirectiveContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    pragmaName(): any;
    pragmaValue(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const PragmaNameContext_base: any;
declare class PragmaNameContext extends PragmaNameContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const PragmaValueContext_base: any;
declare class PragmaValueContext extends PragmaValueContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    version(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VersionContext_base: any;
declare class VersionContext extends VersionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    versionConstraint: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VersionOperatorContext_base: any;
declare class VersionOperatorContext extends VersionOperatorContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VersionConstraintContext_base: any;
declare class VersionConstraintContext extends VersionConstraintContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    VersionLiteral(): any;
    versionOperator(): any;
    DecimalNumber(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ImportDeclarationContext_base: any;
declare class ImportDeclarationContext extends ImportDeclarationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ImportDirectiveContext_base: any;
declare class ImportDirectiveContext extends ImportDirectiveContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    StringLiteralFragment(): any;
    identifier: (i: any) => any;
    importDeclaration: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ContractDefinitionContext_base: any;
declare class ContractDefinitionContext extends ContractDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    inheritanceSpecifier: (i: any) => any;
    contractPart: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const InheritanceSpecifierContext_base: any;
declare class InheritanceSpecifierContext extends InheritanceSpecifierContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    userDefinedTypeName(): any;
    expressionList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ContractPartContext_base: any;
declare class ContractPartContext extends ContractPartContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    stateVariableDeclaration(): any;
    usingForDeclaration(): any;
    structDefinition(): any;
    modifierDefinition(): any;
    functionDefinition(): any;
    eventDefinition(): any;
    enumDefinition(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StateVariableDeclarationContext_base: any;
declare class StateVariableDeclarationContext extends StateVariableDeclarationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    identifier(): any;
    PublicKeyword: (i: any) => any;
    InternalKeyword: (i: any) => any;
    PrivateKeyword: (i: any) => any;
    ConstantKeyword: (i: any) => any;
    ImmutableKeyword: (i: any) => any;
    overrideSpecifier: (i: any) => any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FileLevelConstantContext_base: any;
declare class FileLevelConstantContext extends FileLevelConstantContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    ConstantKeyword(): any;
    identifier(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const UsingForDeclarationContext_base: any;
declare class UsingForDeclarationContext extends UsingForDeclarationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    typeName(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StructDefinitionContext_base: any;
declare class StructDefinitionContext extends StructDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    variableDeclaration: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ModifierDefinitionContext_base: any;
declare class ModifierDefinitionContext extends ModifierDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    block(): any;
    parameterList(): any;
    VirtualKeyword: (i: any) => any;
    overrideSpecifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ModifierInvocationContext_base: any;
declare class ModifierInvocationContext extends ModifierInvocationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    expressionList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionDefinitionContext_base: any;
declare class FunctionDefinitionContext extends FunctionDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    functionDescriptor(): any;
    parameterList(): any;
    modifierList(): any;
    block(): any;
    returnParameters(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionDescriptorContext_base: any;
declare class FunctionDescriptorContext extends FunctionDescriptorContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    ConstructorKeyword(): any;
    FallbackKeyword(): any;
    ReceiveKeyword(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ReturnParametersContext_base: any;
declare class ReturnParametersContext extends ReturnParametersContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    parameterList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ModifierListContext_base: any;
declare class ModifierListContext extends ModifierListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    ExternalKeyword: (i: any) => any;
    PublicKeyword: (i: any) => any;
    InternalKeyword: (i: any) => any;
    PrivateKeyword: (i: any) => any;
    VirtualKeyword: (i: any) => any;
    stateMutability: (i: any) => any;
    modifierInvocation: (i: any) => any;
    overrideSpecifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EventDefinitionContext_base: any;
declare class EventDefinitionContext extends EventDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    eventParameterList(): any;
    AnonymousKeyword(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EnumValueContext_base: any;
declare class EnumValueContext extends EnumValueContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EnumDefinitionContext_base: any;
declare class EnumDefinitionContext extends EnumDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    enumValue: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ParameterListContext_base: any;
declare class ParameterListContext extends ParameterListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    parameter: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ParameterContext_base: any;
declare class ParameterContext extends ParameterContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    storageLocation(): any;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EventParameterListContext_base: any;
declare class EventParameterListContext extends EventParameterListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    eventParameter: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EventParameterContext_base: any;
declare class EventParameterContext extends EventParameterContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    IndexedKeyword(): any;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionTypeParameterListContext_base: any;
declare class FunctionTypeParameterListContext extends FunctionTypeParameterListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    functionTypeParameter: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionTypeParameterContext_base: any;
declare class FunctionTypeParameterContext extends FunctionTypeParameterContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    storageLocation(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VariableDeclarationContext_base: any;
declare class VariableDeclarationContext extends VariableDeclarationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    identifier(): any;
    storageLocation(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const TypeNameContext_base: any;
declare class TypeNameContext extends TypeNameContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    elementaryTypeName(): any;
    userDefinedTypeName(): any;
    mapping(): any;
    functionTypeName(): any;
    PayableKeyword(): any;
    typeName(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const UserDefinedTypeNameContext_base: any;
declare class UserDefinedTypeNameContext extends UserDefinedTypeNameContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const MappingKeyContext_base: any;
declare class MappingKeyContext extends MappingKeyContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    elementaryTypeName(): any;
    userDefinedTypeName(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const MappingContext_base: any;
declare class MappingContext extends MappingContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    mappingKey(): any;
    typeName(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionTypeNameContext_base: any;
declare class FunctionTypeNameContext extends FunctionTypeNameContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    functionTypeParameterList: (i: any) => any;
    InternalKeyword: (i: any) => any;
    ExternalKeyword: (i: any) => any;
    stateMutability: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StorageLocationContext_base: any;
declare class StorageLocationContext extends StorageLocationContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StateMutabilityContext_base: any;
declare class StateMutabilityContext extends StateMutabilityContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    PureKeyword(): any;
    ConstantKeyword(): any;
    ViewKeyword(): any;
    PayableKeyword(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const BlockContext_base: any;
declare class BlockContext extends BlockContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    statement: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StatementContext_base: any;
declare class StatementContext extends StatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    ifStatement(): any;
    tryStatement(): any;
    whileStatement(): any;
    forStatement(): any;
    block(): any;
    inlineAssemblyStatement(): any;
    doWhileStatement(): any;
    continueStatement(): any;
    breakStatement(): any;
    returnStatement(): any;
    throwStatement(): any;
    emitStatement(): any;
    simpleStatement(): any;
    uncheckedStatement(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ExpressionStatementContext_base: any;
declare class ExpressionStatementContext extends ExpressionStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const IfStatementContext_base: any;
declare class IfStatementContext extends IfStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    statement: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const TryStatementContext_base: any;
declare class TryStatementContext extends TryStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    block(): any;
    returnParameters(): any;
    catchClause: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const CatchClauseContext_base: any;
declare class CatchClauseContext extends CatchClauseContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    block(): any;
    parameterList(): any;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const WhileStatementContext_base: any;
declare class WhileStatementContext extends WhileStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    statement(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const SimpleStatementContext_base: any;
declare class SimpleStatementContext extends SimpleStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    variableDeclarationStatement(): any;
    expressionStatement(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const UncheckedStatementContext_base: any;
declare class UncheckedStatementContext extends UncheckedStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    block(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ForStatementContext_base: any;
declare class ForStatementContext extends ForStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    statement(): any;
    simpleStatement(): any;
    expressionStatement(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const InlineAssemblyStatementContext_base: any;
declare class InlineAssemblyStatementContext extends InlineAssemblyStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyBlock(): any;
    StringLiteralFragment(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const DoWhileStatementContext_base: any;
declare class DoWhileStatementContext extends DoWhileStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    statement(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ContinueStatementContext_base: any;
declare class ContinueStatementContext extends ContinueStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    ContinueKeyword(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const BreakStatementContext_base: any;
declare class BreakStatementContext extends BreakStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    BreakKeyword(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ReturnStatementContext_base: any;
declare class ReturnStatementContext extends ReturnStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ThrowStatementContext_base: any;
declare class ThrowStatementContext extends ThrowStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const EmitStatementContext_base: any;
declare class EmitStatementContext extends EmitStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    functionCall(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VariableDeclarationStatementContext_base: any;
declare class VariableDeclarationStatementContext extends VariableDeclarationStatementContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifierList(): any;
    variableDeclaration(): any;
    variableDeclarationList(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const VariableDeclarationListContext_base: any;
declare class VariableDeclarationListContext extends VariableDeclarationListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    variableDeclaration: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const IdentifierListContext_base: any;
declare class IdentifierListContext extends IdentifierListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ElementaryTypeNameContext_base: any;
declare class ElementaryTypeNameContext extends ElementaryTypeNameContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    Int(): any;
    Uint(): any;
    Byte(): any;
    Fixed(): any;
    Ufixed(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ExpressionContext_base: any;
declare class ExpressionContext extends ExpressionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    typeName(): any;
    expression: (i: any) => any;
    primaryExpression(): any;
    identifier(): any;
    nameValueList(): any;
    functionCallArguments(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const PrimaryExpressionContext_base: any;
declare class PrimaryExpressionContext extends PrimaryExpressionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    BooleanLiteral(): any;
    numberLiteral(): any;
    hexLiteral(): any;
    stringLiteral(): any;
    identifier(): any;
    TypeKeyword(): any;
    PayableKeyword(): any;
    tupleExpression(): any;
    typeNameExpression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const ExpressionListContext_base: any;
declare class ExpressionListContext extends ExpressionListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const NameValueListContext_base: any;
declare class NameValueListContext extends NameValueListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    nameValue: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const NameValueContext_base: any;
declare class NameValueContext extends NameValueContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    expression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionCallArgumentsContext_base: any;
declare class FunctionCallArgumentsContext extends FunctionCallArgumentsContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    nameValueList(): any;
    expressionList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const FunctionCallContext_base: any;
declare class FunctionCallContext extends FunctionCallContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression(): any;
    functionCallArguments(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyBlockContext_base: any;
declare class AssemblyBlockContext extends AssemblyBlockContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyItem: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyItemContext_base: any;
declare class AssemblyItemContext extends AssemblyItemContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    assemblyBlock(): any;
    assemblyExpression(): any;
    assemblyLocalDefinition(): any;
    assemblyAssignment(): any;
    assemblyStackAssignment(): any;
    labelDefinition(): any;
    assemblySwitch(): any;
    assemblyFunctionDefinition(): any;
    assemblyFor(): any;
    assemblyIf(): any;
    BreakKeyword(): any;
    ContinueKeyword(): any;
    LeaveKeyword(): any;
    subAssembly(): any;
    numberLiteral(): any;
    stringLiteral(): any;
    hexLiteral(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyExpressionContext_base: any;
declare class AssemblyExpressionContext extends AssemblyExpressionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyCall(): any;
    assemblyLiteral(): any;
    assemblyMember(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyMemberContext_base: any;
declare class AssemblyMemberContext extends AssemblyMemberContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyCallContext_base: any;
declare class AssemblyCallContext extends AssemblyCallContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    assemblyExpression: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyLocalDefinitionContext_base: any;
declare class AssemblyLocalDefinitionContext extends AssemblyLocalDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyIdentifierOrList(): any;
    assemblyExpression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyAssignmentContext_base: any;
declare class AssemblyAssignmentContext extends AssemblyAssignmentContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyIdentifierOrList(): any;
    assemblyExpression(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyIdentifierOrListContext_base: any;
declare class AssemblyIdentifierOrListContext extends AssemblyIdentifierOrListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    assemblyMember(): any;
    assemblyIdentifierList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyIdentifierListContext_base: any;
declare class AssemblyIdentifierListContext extends AssemblyIdentifierListContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyStackAssignmentContext_base: any;
declare class AssemblyStackAssignmentContext extends AssemblyStackAssignmentContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const LabelDefinitionContext_base: any;
declare class LabelDefinitionContext extends LabelDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblySwitchContext_base: any;
declare class AssemblySwitchContext extends AssemblySwitchContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyExpression(): any;
    assemblyCase: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyCaseContext_base: any;
declare class AssemblyCaseContext extends AssemblyCaseContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyLiteral(): any;
    assemblyBlock(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyFunctionDefinitionContext_base: any;
declare class AssemblyFunctionDefinitionContext extends AssemblyFunctionDefinitionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    assemblyBlock(): any;
    assemblyIdentifierList(): any;
    assemblyFunctionReturns(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyFunctionReturnsContext_base: any;
declare class AssemblyFunctionReturnsContext extends AssemblyFunctionReturnsContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyIdentifierList(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyForContext_base: any;
declare class AssemblyForContext extends AssemblyForContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyExpression: (i: any) => any;
    assemblyBlock: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyIfContext_base: any;
declare class AssemblyIfContext extends AssemblyIfContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    assemblyExpression(): any;
    assemblyBlock(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const AssemblyLiteralContext_base: any;
declare class AssemblyLiteralContext extends AssemblyLiteralContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    stringLiteral(): any;
    DecimalNumber(): any;
    HexNumber(): any;
    hexLiteral(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const SubAssemblyContext_base: any;
declare class SubAssemblyContext extends SubAssemblyContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    identifier(): any;
    assemblyBlock(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const TupleExpressionContext_base: any;
declare class TupleExpressionContext extends TupleExpressionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    expression: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const TypeNameExpressionContext_base: any;
declare class TypeNameExpressionContext extends TypeNameExpressionContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    elementaryTypeName(): any;
    userDefinedTypeName(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const NumberLiteralContext_base: any;
declare class NumberLiteralContext extends NumberLiteralContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    DecimalNumber(): any;
    HexNumber(): any;
    NumberUnit(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const IdentifierContext_base: any;
declare class IdentifierContext extends IdentifierContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    ReceiveKeyword(): any;
    PayableKeyword(): any;
    LeaveKeyword(): any;
    Identifier(): any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const HexLiteralContext_base: any;
declare class HexLiteralContext extends HexLiteralContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    HexLiteralFragment: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const OverrideSpecifierContext_base: any;
declare class OverrideSpecifierContext extends OverrideSpecifierContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    userDefinedTypeName: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
declare const StringLiteralContext_base: any;
declare class StringLiteralContext extends StringLiteralContext_base {
    [x: string]: any;
    constructor(parser: any, parent: any, invokingState: any);
    parser: any;
    ruleIndex: number;
    StringLiteralFragment: (i: any) => any;
    enterRule(listener: any): void;
    exitRule(listener: any): void;
}
