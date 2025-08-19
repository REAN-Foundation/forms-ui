import {
    OperationType,
    LogicalOperatorType,
    OperandType,
    OperandDataType,
    CompositionOperatorType,
    MathematicalOperatorType,
    LogicType
} from './enums';

import type {
    Operation,
    Rule,
    LogicalOperation,
    CompositionOperation,
    MathematicalOperation,
    FunctionExpressionOperation,
    Operand,
    Logic,
    SkipLogic,
    CalculationLogic,
    ValidationLogic,
    SkipRule,
    CalculationRule,
    ValidationRule
} from './interfaces';


export class RuleBuilder {

    static createSkipRule(
        id: string,
        name: string,
        condition: Operation
    ): Rule {
        return {
            id,
            Name: name,
            Operation: condition
        };
    }

    static createValidationRule(
        id: string,
        name: string,
        condition: Operation,
        errorMessage: string
    ): Rule {
        return {
            id,
            Name: name,
            Operation: condition,
            ErrorMessage: errorMessage
        };
    }

    static createCalculationRule(
        id: string,
        name: string,
        calculation: Operation
    ): Rule {
        return {
            id,
            Name: name,
            Operation: calculation
        };
    }
}

export class OperationBuilder {
    static equals(fieldId: string, value: any): LogicalOperation {
        return {
            id: `${fieldId}-equals-${value}`,
            Type: OperationType.Logical,
            Operator: LogicalOperatorType.Equal,
            Operands: [
                { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: fieldId },
                { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: value }
            ]
        };
    }

    static greaterThan(fieldId: string, value: number): LogicalOperation {
        return {
            id: `${fieldId}-gt-${value}`,
            Type: OperationType.Logical,
            Operator: LogicalOperatorType.GreaterThan,
            Operands: [
                { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: fieldId },
                { Type: OperandType.Constant, DataType: OperandDataType.Float, Value: value }
            ]
        };
    }

    static and(...operations: Operation[]): CompositionOperation {
        return {
            id: `and-${Date.now()}`,
            Type: OperationType.Composition,
            Operator: CompositionOperatorType.And,
            Children: operations
        };
    }

    static or(...operations: Operation[]): CompositionOperation {
        return {
            id: `or-${Date.now()}`,
            Type: OperationType.Composition,
            Operator: CompositionOperatorType.Or,
            Children: operations
        };
    }

    static add(...fieldIds: string[]): MathematicalOperation {
        return {
            id: `add-${fieldIds.join('-')}`,
            Type: OperationType.Mathematical,
            Operator: MathematicalOperatorType.Add,
            Operands: fieldIds.map(fieldId => ({
                Type: OperandType.FieldReference,
                DataType: OperandDataType.Float,
                fieldId
            }))
        };
    }

    static multiply(fieldId1: string, fieldId2: string): MathematicalOperation {
        return {
            id: `multiply-${fieldId1}-${fieldId2}`,
            Type: OperationType.Mathematical,
            Operator: MathematicalOperatorType.Multiply,
            Operands: [
                { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: fieldId1 },
                { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: fieldId2 }
            ]
        };
    }

    static functionExpression(id: string, expression: string, variables: Record<string, Operand>): FunctionExpressionOperation {
        return {
            id,
            Type: OperationType.FunctionExpression,
            Expression: expression,
            Variables: variables
        };
    }

    // Helper methods for creating common function expressions
    static bmiCalculation(weightFieldId: string, heightFieldId: string): FunctionExpressionOperation {
        return this.functionExpression(
            'bmi-calculation',
            'weight / (height / 100) ^ 2',
            {
                weight: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: weightFieldId },
                height: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: heightFieldId }
            }
        );
    }

    static loanPaymentCalculation(principalFieldId: string, rateFieldId: string, termFieldId: string): FunctionExpressionOperation {
        return this.functionExpression(
            'loan-payment',
            'P * (r * (1 + r)^n) / ((1 + r)^n - 1)',
            {
                P: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: principalFieldId },
                r: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: rateFieldId },
                n: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: termFieldId }
            }
        );
    }

    static percentageCalculation(valueFieldId: string, percentageFieldId: string): FunctionExpressionOperation {
        return this.functionExpression(
            'percentage-calculation',
            'value * (percentage / 100)',
            {
                value: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: valueFieldId },
                percentage: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: percentageFieldId }
            }
        );
    }
}

export class LogicBuilder {
    private id: string;
    private type: LogicType;
    private fieldId: string;
    private rules: Rule[] = [];
    private fallbackRule?: Rule;
    private enabled = true;

    constructor(id: string, type: LogicType, fieldId: string) {
        this.id = id;
        this.type = type;
        this.fieldId = fieldId;
    }

    static skipLogic(id: string, fieldId: string): LogicBuilder {
        return new LogicBuilder(id, LogicType.Skip, fieldId);
    }

    static calculationLogic(id: string, fieldId: string): LogicBuilder {
        return new LogicBuilder(id, LogicType.Calculation, fieldId);
    }

    static validationLogic(id: string, fieldId: string): LogicBuilder {
        return new LogicBuilder(id, LogicType.Validation, fieldId);
    }

    addRule(rule: Rule): LogicBuilder {
        this.rules.push(rule);
        return this;
    }

    setFallbackRule(rule: Rule): LogicBuilder {
        this.fallbackRule = rule;
        return this;
    }

    setEnabled(enabled: boolean): LogicBuilder {
        this.enabled = enabled;
        return this;
    }

    build(): Logic {
        return {
            id: this.id,
            Type: this.type,
            FieldId: this.fieldId,
            Rules: this.rules,
            FallbackRule: this.fallbackRule,
            Enabled: this.enabled
        };
    }
}

// New Typed Logic Builders

export class SkipLogicBuilder {
    private id: string;
    private fieldId: string;
    private rules: SkipRule[] = [];
    private defaultSkip?: boolean;
    private enabled = true;

    constructor(id: string, fieldId: string) {
        this.id = id;
        this.fieldId = fieldId;
    }

    addSkipRule(id: string, name: string, condition: Operation, skipWhenTrue = true): SkipLogicBuilder {
        this.rules.push({
            id,
            Name: name,
            Operation: condition,
            SkipWhenTrue: skipWhenTrue
        });
        return this;
    }

    setDefaultSkip(defaultSkip: boolean): SkipLogicBuilder {
        this.defaultSkip = defaultSkip;
        return this;
    }

    setEnabled(enabled: boolean): SkipLogicBuilder {
        this.enabled = enabled;
        return this;
    }

    build(): SkipLogic {
        return {
            id: this.id,
            Type: LogicType.Skip,
            FieldId: this.fieldId,
            Enabled: this.enabled,
            Rules: this.rules,
            DefaultSkip: this.defaultSkip
        };
    }
}

export class CalculationLogicBuilder {
    private id: string;
    private fieldId: string;
    private rules: CalculationRule[] = [];
    private fallbackValue?: any;
    private enabled = true;

    constructor(id: string, fieldId: string) {
        this.id = id;
        this.fieldId = fieldId;
    }

    addCalculationRule(id: string, name: string, valueExpression: Operation, condition?: Operation): CalculationLogicBuilder {
        this.rules.push({
            id,
            Name: name,
            ConditionForOperation: condition,
            Operation: valueExpression
        });
        return this;
    }

    setFallbackValue(value: any): CalculationLogicBuilder {
        this.fallbackValue = value;
        return this;
    }

    setEnabled(enabled: boolean): CalculationLogicBuilder {
        this.enabled = enabled;
        return this;
    }

    build(): CalculationLogic {
        return {
            id: this.id,
            Type: LogicType.Calculation,
            FieldId: this.fieldId,
            Enabled: this.enabled,
            Rules: this.rules,
            FallbackValue: this.fallbackValue
        };
    }
}

export class ValidationLogicBuilder {
    private id: string;
    private fieldId: string;
    private rules: ValidationRule[] = [];
    private enabled = true;

    constructor(id: string, fieldId: string) {
        this.id = id;
        this.fieldId = fieldId;
    }

    addValidationRule(
        id: string,
        name: string,
        validationExpression: Operation,
        errorMessage: string,
        errorWhenFalse = true): ValidationLogicBuilder {

        this.rules.push({
            id,
            Name: name,
            Operation: validationExpression,
            ErrorWhenFalse: errorWhenFalse,
            ErrorMessage: errorMessage
        });
        return this;
    }

    setEnabled(enabled: boolean): ValidationLogicBuilder {
        this.enabled = enabled;
        return this;
    }

    build(): ValidationLogic {
        return {
            id: this.id,
            Type: LogicType.Validation,
            FieldId: this.fieldId,
            Enabled: this.enabled,
            Rules: this.rules
        };
    }
}
