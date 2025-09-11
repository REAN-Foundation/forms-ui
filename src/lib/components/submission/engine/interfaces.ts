import {
    CompositionOperatorType,
    FieldResponseType,
    LogicalOperatorType,
    LogicType,
    MathematicalOperatorType,
    OperandDataType,
    OperandType,
    OperationType
} from './enums';

// interfaces.ts
export interface Operand {
    Type         : OperandType;
    DataType     : OperandDataType;
    Value       ?: any;
    FieldId     ?: string;
    FunctionName?: string;
    FunctionArgs?: Operand[];
}

export interface BaseOperation {
    id: string;
    Type: OperationType;
}

export interface LogicalOperation extends BaseOperation {
    Type: OperationType.Logical;
    Operator: LogicalOperatorType;
    Operands: Operand[];
}

export interface MathematicalOperation extends BaseOperation {
    Type: OperationType.Mathematical;
    Operator: MathematicalOperatorType;
    Operands: Operand[];
}

export interface CompositionOperation extends BaseOperation {
    Type: OperationType.Composition;
    Operator: CompositionOperatorType;
    Children: Operation[];
}

export interface IterateOperation extends BaseOperation {
    Type: OperationType.Iterate;
    ArrayOperand: Operand;
    ItemAlias: string;
    Operation: Operation;
}

export interface FunctionExpressionOperation extends BaseOperation {
    Type: OperationType.FunctionExpression;
    Expression: string;
    Variables: Record<string, Operand>;
}

export type Operation = LogicalOperation |
            MathematicalOperation |
            CompositionOperation |
            IterateOperation |
            FunctionExpressionOperation;

// New Rule Types with Clear Outcomes

export interface BaseRule {
    id: string;
    Name: string;
    Description?: string;
}

export interface SkipRule extends BaseRule {
    Operation: Operation;           // When should we consider skipping?
    SkipWhenTrue: boolean;         // Skip field if condition evaluates to true (or false)
}

export interface CalculationRule extends BaseRule {
    ConditionForOperation?: Operation;         // Optional: When should this calculation apply?
    Operation: Operation;
    RuleOutcome?: any;  // What value should be calculated?
}

export interface ValidationRule extends BaseRule {
    Operation: Operation;           // What should be validated?
    ErrorWhenFalse: boolean;         // Show error when expression is false (typical) or true
    ErrorMessage: string;            // Error message to show when validation fails
}

// Legacy Rule interface for backward compatibility
export interface Rule {
    id           : string;
    Name         : string;
    Description ?: string;
    Operation    : Operation;
    ErrorMessage?: string;     // For validation rules
}

export interface Logic {
    id           : string;
    Type         : LogicType;
    FieldId      : string;
    Rules        : Rule[];
    FallbackRule?: Rule;
    Enabled      : boolean;
}

// New Logic Interfaces with Specific Rule Types

export interface SkipLogic {
    id: string;
    Type: LogicType.Skip;
    FieldId: string;
    Enabled: boolean;
    Rules: SkipRule[];
    DefaultSkip?: boolean;  // Default behavior when no rules match
}

export interface CalculationLogic {
    id: string;
    Type: LogicType.Calculation;
    FieldId: string;
    Enabled: boolean;
    Rules: CalculationRule[];
    FallbackValue?: any;  // Default value when no rules match
}

export interface ValidationLogic {
    id: string;
    Type: LogicType.Validation;
    FieldId: string;
    Enabled: boolean;
    Rules: ValidationRule[];
}

export type TypedLogic = SkipLogic | CalculationLogic | ValidationLogic;

export interface FormField {
    FieldId: string;
    Name           : string;
    Label          : string;
    ResponseType   : FieldResponseType;
    Required       : boolean;
    Value         ?: any;
    SkipLogic     ?: SkipLogic | null;
    CalculateLogic?: CalculationLogic | null;
    ValidateLogic ?: ValidationLogic | null;
}

export interface Form {
    id          : string;
    Name        : string;
    Description?: string;
    Fields      : FormField[];
}

export interface EvaluationContext {
    Form          : Form;
    CurrentFieldId: string;
    FieldValues   : Map<string, any>;
}

export interface EvaluationResult {
    Success    : boolean;
    Value     ?: any;
    Error     ?: string;
    ShouldSkip?: boolean;
}

// New Evaluation Result Types

export interface SkipEvaluationResult {
    ShouldSkip: boolean;
    MatchedRule?: SkipRule;
}

export interface CalculationEvaluationResult {
    Success: boolean;
    Value?: any;
    Error?: string;
    MatchedRule?: CalculationRule;
}

export interface ValidationEvaluationResult {
    IsValid: boolean;
    Errors: string[];
    FailedRules: ValidationRule[];
}
