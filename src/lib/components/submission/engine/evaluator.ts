// evaluator.ts

import {
    CompositionOperatorType,
    LogicalOperatorType,
    LogicType,
    MathematicalOperatorType,
    OperandType,
    OperationType
} from './enums';

import type {
    CompositionOperation,
    EvaluationContext,
    EvaluationResult,
    FunctionExpressionOperation,
    IterateOperation,
    Logic,
    LogicalOperation,
    MathematicalOperation,
    Operand,
    Operation,
    Rule,
    // New typed interfaces
    SkipLogic,
    CalculationLogic,
    ValidationLogic,
    // SkipRule,
    // CalculationRule,
    ValidationRule,
    SkipEvaluationResult,
    CalculationEvaluationResult,
    ValidationEvaluationResult
} from './interfaces';


export class RuleEvaluator {

    private context: EvaluationContext;

    constructor(context: EvaluationContext) {
        this.context = context;
    }

    // Legacy evaluation method (backward compatibility)
    evaluateLogic(logic: Logic): EvaluationResult {
        // Try to evaluate each rule in order
        for (const rule of logic.Rules) {
            const result = this.evaluateRule(rule);
            if (result.Success || result.Error) {
                return result;
            }
        }

        // If no rule matched and there's a fallback, use it
        if (logic.FallbackRule) {
            return this.evaluateRule(logic.FallbackRule);
        }

        // Default result based on logic type
        switch (logic.Type) {
            case LogicType.Skip:
                return { Success: true, ShouldSkip: false };
            case LogicType.Validation:
                return { Success: true };
            case LogicType.Calculation:
                return { Success: true, Value: null };
            default:
                return { Success: false, Error: 'Unknown logic type' };
        }
    }

    // New typed evaluation methods

    evaluateSkipLogic(logic: SkipLogic): SkipEvaluationResult {
        for (const rule of logic.Rules) {
            try {
                const conditionResult = this.evaluateOperation(rule.Operation);

                // If condition is true and rule says "skip when true", or condition is false and rule says "skip when false"
                const shouldSkip = rule.SkipWhenTrue ? conditionResult === true : conditionResult === false;

                if (shouldSkip) {
                    return { ShouldSkip: true, MatchedRule: rule };
                }
            } catch (error) {
                // Continue to next rule if this one fails
                continue;
            }
        }

        // No rules matched, use default
        return { ShouldSkip: logic.DefaultSkip || false };
    }

    evaluateCalculationLogic(logic: CalculationLogic): CalculationEvaluationResult {
        for (const rule of logic.Rules) {
            try {
                // Check condition if it exists
                if (rule.ConditionForOperation) {
                    const conditionResult = this.evaluateOperation(rule.ConditionForOperation);
                    if (!conditionResult) {
                        continue; // Condition not met, try next rule
                    }
                }

                // Condition met (or no condition), evaluate the value expression
                const value = this.evaluateOperation(rule.Operation);
                return { Success: true, Value: value, MatchedRule: rule };

            } catch (error: any) {
                return { Success: false, Error: error.message, MatchedRule: rule };
            }
        }

        // No rules matched, use fallback
        return { Success: true, Value: logic.FallbackValue || null };
    }

    evaluateValidationLogic(logic: ValidationLogic): ValidationEvaluationResult {
        const errors: string[] = [];
        const failedRules: ValidationRule[] = [];

        for (const rule of logic.Rules) {
            try {
                const validationResult = this.evaluateOperation(rule.Operation);

                // Check if validation failed based on errorWhenFalse setting
                const validationFailed = rule.ErrorWhenFalse ? (validationResult === false) : (validationResult === true);

                if (validationFailed) {
                    errors.push(rule.ErrorMessage);
                    failedRules.push(rule);
                }
            } catch (error: any) {
                // If validation expression fails to evaluate, consider it a validation error
                errors.push(`Validation error in rule '${rule.Name}': ${error.message}`);
                failedRules.push(rule);
            }
        }

        return {
            IsValid: errors.length === 0,
            Errors: errors,
            FailedRules: failedRules
        };
    }

    private evaluateRule(rule: Rule): EvaluationResult {
        try {
            const operationResult = this.evaluateOperation(rule.Operation);

            if (rule.ErrorMessage && !operationResult) {
                return { Success: false, Error: rule.ErrorMessage };
            }

            return { Success: true, Value: operationResult };
        } catch (error: any) {
            return { Success: false, Error: error.message };
        }
    }

    private evaluateOperation(operation: Operation): any {
        switch (operation.Type) {
            case OperationType.Logical:
                return this.evaluateLogicalOperation(operation as LogicalOperation);
            case OperationType.Mathematical:
                return this.evaluateMathematicalOperation(operation as MathematicalOperation);
            case OperationType.Composition:
                return this.evaluateCompositionOperation(operation as CompositionOperation);
            case OperationType.Iterate:
                return this.evaluateIterateOperation(operation as IterateOperation);
            case OperationType.FunctionExpression:
                return this.evaluateFunctionExpression(operation as FunctionExpressionOperation);
            default:
                throw new Error('Unknown operation type');
        }
    }

    private evaluateLogicalOperation(operation: LogicalOperation): boolean {
        const operandValues = operation.Operands.map(op => this.resolveOperand(op));

        switch (operation.Operator) {
            case LogicalOperatorType.Equal:
                return operandValues[0] === operandValues[1];
            case LogicalOperatorType.NotEqual:
                return operandValues[0] !== operandValues[1];
            case LogicalOperatorType.GreaterThan:
                return operandValues[0] > operandValues[1];
            case LogicalOperatorType.GreaterThanOrEqual:
                return operandValues[0] >= operandValues[1];
            case LogicalOperatorType.LessThan:
                return operandValues[0] < operandValues[1];
            case LogicalOperatorType.LessThanOrEqual:
                return operandValues[0] <= operandValues[1];
            case LogicalOperatorType.In:
                return operandValues[1].includes(operandValues[0]);
            case LogicalOperatorType.NotIn:
                return !operandValues[1].includes(operandValues[0]);
            case LogicalOperatorType.Contains:
                return String(operandValues[0]).includes(String(operandValues[1]));
            case LogicalOperatorType.DoesNotContain:
                return !String(operandValues[0]).includes(String(operandValues[1]));
            case LogicalOperatorType.Between:
                return operandValues[0] >= operandValues[1] && operandValues[0] <= operandValues[2];
            case LogicalOperatorType.IsTrue:
                return operandValues[0] === true;
            case LogicalOperatorType.IsFalse:
                return operandValues[0] === false;
            case LogicalOperatorType.Exists:
                return operandValues[0] !== null && operandValues[0] !== undefined;
            case LogicalOperatorType.HasConsecutiveOccurrences:
                return this.hasConsecutiveOccurrences(operandValues[0], operandValues[1], operandValues[2]);
            case LogicalOperatorType.RangesOverlap:
                return this.rangesOverlap(operandValues[0], operandValues[1]);
            default:
                throw new Error(`Unknown logical operator: ${operation.Operator}`);
        }
    }

    private evaluateMathematicalOperation(operation: MathematicalOperation): number {
        const operandValues = operation.Operands.map(op => Number(this.resolveOperand(op)));

        switch (operation.Operator) {
            case MathematicalOperatorType.Add:
                return operandValues.reduce((a, b) => a + b, 0);
            case MathematicalOperatorType.Subtract:
                return operandValues[0] - operandValues[1];
            case MathematicalOperatorType.Multiply:
                return operandValues.reduce((a, b) => a * b, 1);
            case MathematicalOperatorType.Divide:
                if (operandValues[1] === 0) throw new Error('Division by zero');
                return operandValues[0] / operandValues[1];
            case MathematicalOperatorType.Percentage:
                return (operandValues[0] / operandValues[1]) * 100;
            case MathematicalOperatorType.Power:
                return Math.pow(operandValues[0], operandValues[1]);
            case MathematicalOperatorType.Modulo:
                return operandValues[0] % operandValues[1];
            default:
                throw new Error(`Unknown mathematical operator: ${operation.Operator}`);
        }
    }

    private evaluateCompositionOperation(operation: CompositionOperation): boolean {
        const childResults = operation.Children.map(child => this.evaluateOperation(child));

        switch (operation.Operator) {
            case CompositionOperatorType.And:
                return childResults.every(result => result === true);
            case CompositionOperatorType.Or:
                return childResults.some(result => result === true);
            case CompositionOperatorType.Xor:
                return childResults.filter(result => result === true).length === 1;
            default:
                throw new Error(`Unknown composition operator: ${operation.Operator}`);
        }
    }

    private evaluateIterateOperation(operation: IterateOperation): any[] {
        const arrayValue = this.resolveOperand(operation.ArrayOperand);

        if (!Array.isArray(arrayValue)) {
            throw new Error('Iterate operation requires an array operand');
        }

        return arrayValue.map(item => {
            // Create a temporary context with the iteration variable
            const tempContext = { ...this.context };
            tempContext.FieldValues.set(operation.ItemAlias, item);

            const tempEvaluator = new RuleEvaluator(tempContext);
            return tempEvaluator.evaluateOperation(operation.Operation);
        });
    }

    private evaluateFunctionExpression(operation: FunctionExpressionOperation): any {
        // Resolve all variables in the expression
        const resolvedVariables: Record<string, any> = {};
        for (const [varName, operand] of Object.entries(operation.Variables)) {
            resolvedVariables[varName] = this.resolveOperand(operand);
        }

        // Parse and evaluate the expression
        return this.parseAndEvaluateExpression(operation.Expression, resolvedVariables);
    }

    private parseAndEvaluateExpression(expression: string, variables: Record<string, any>): any {
        try {
            // Replace variables with their values
            let processedExpression = expression;

            // Replace variables in the expression
            Object.entries(variables).forEach(([varName, value]) => {
                const regex = new RegExp(`\\b${varName}\\b`, 'g');
                let replacement: string;
                // Special-case common regex variable: allow expressions like regex.test(input)
                if (typeof value === 'string' && varName.toLowerCase() === 'regex') {
                    // Compile the pattern at evaluation time
                    replacement = `new RegExp(${this.formatValue(value)})`;
                } else {
                    replacement = this.formatValue(value);
                }
                processedExpression = processedExpression.replace(regex, replacement);
            });

            // Replace built-in functions and constants
            processedExpression = this.replaceFunctionsAndConstants(processedExpression);

            // Evaluate the expression using Function constructor (safe for mathematical expressions)
            return this.safeEvaluate(processedExpression);
        } catch (error: any) {
            throw new Error(`Expression evaluation failed: ${error.message}`);
        }
    }

    private formatValue(value: any): string {
        if (value === null || value === undefined) {
            return '0';
        }
        if (typeof value === 'string') {
            return `"${value.replace(/"/g, '\\"')}"`;
        }
        if (Array.isArray(value)) {
            return `[${value.map(v => this.formatValue(v)).join(',')}]`;
        }
        return String(value);
    }

    private replaceFunctionsAndConstants(expression: string): string {
        // Replace mathematical functions
        expression = expression.replace(/\bpow\(([^,]+),\s*([^)]+)\)/g, 'Math.pow($1, $2)');
        expression = expression.replace(/\bsqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
        expression = expression.replace(/\babs\(([^)]+)\)/g, 'Math.abs($1)');
        expression = expression.replace(/\bceil\(([^)]+)\)/g, 'Math.ceil($1)');
        expression = expression.replace(/\bfloor\(([^)]+)\)/g, 'Math.floor($1)');
        expression = expression.replace(/\bround\(([^)]+)\)/g, 'Math.round($1)');
        expression = expression.replace(/\bmin\(([^)]+)\)/g, 'Math.min($1)');
        expression = expression.replace(/\bmax\(([^)]+)\)/g, 'Math.max($1)');

        // Replace array functions
        expression = expression.replace(/\bsum\(([^)]+)\)/g, '($1).reduce((a,b) => a + b, 0)');
        expression = expression.replace(/\bavg\(([^)]+)\)/g, '(($1).reduce((a,b) => a + b, 0) / ($1).length)');
        expression = expression.replace(/\bcount\(([^)]+)\)/g, '($1).length');

        // Replace constants
        expression = expression.replace(/\bPI\b/g, 'Math.PI');
        expression = expression.replace(/\bE\b/g, 'Math.E');

        // Replace power operator ^ with Math.pow
        expression = expression.replace(/([^*+\-/()]+)\s*\^\s*([^*+\-/()]+)/g, 'Math.pow($1, $2)');

        // Replace date functions
        expression = expression.replace(/\bnow\(\)/g, 'Date.now()');

        return expression;
    }

    private safeEvaluate(expression: string): any {
        // Basic safety check - only allow mathematical operations and safe functions
        // Include > and = for arrow functions, ! for logical not, ? : for ternary
        const allowedPattern = /^[0-9+\-*/.() \t\n\r,[\]"'a-zA-Z_$<>=!?:&|]+$/;
        if (!allowedPattern.test(expression)) {
            throw new Error('Expression contains invalid characters');
        }

        // Blacklist dangerous functions
        const dangerousFunctions = ['eval', 'Function', 'setTimeout', 'setInterval', 'require', 'import'];
        for (const dangerous of dangerousFunctions) {
            if (expression.includes(dangerous)) {
                throw new Error(`Dangerous function '${dangerous}' not allowed in expressions`);
            }
        }

        try {
            // Use Function constructor to evaluate mathematical expressions safely
            const func = new Function('Math', 'Date', `return ${expression}`);
            return func(Math, Date);
        } catch (error: any) {
            throw new Error(`Invalid expression: ${error.message}`);
        }
    }

    private resolveOperand(operand: Operand): any {
        switch (operand.Type) {
            case OperandType.Constant:
                return operand.Value;
            case OperandType.FieldReference:
                return this.context.FieldValues.get(operand.FieldId as string);
            case OperandType.Function:
                return this.evaluateFunction(operand.FunctionName!, operand.FunctionArgs || []);
            default:
                throw new Error(`Unknown operand type: ${operand.Type}`);
        }
    }

    private evaluateFunction(functionName: string, args: Operand[]): any {
        const argValues = args.map(arg => this.resolveOperand(arg));

        switch (functionName) {
            case 'sum':
                return argValues.reduce((a, b) => a + b, 0);
            case 'avg':
                return argValues.reduce((a, b) => a + b, 0) / argValues.length;
            case 'min':
                return Math.min(...argValues);
            case 'max':
                return Math.max(...argValues);
            case 'count':
                return argValues.length;
            case 'abs':
                return Math.abs(argValues[0]);
            case 'round':
                return Math.round(argValues[0]);
            case 'floor':
                return Math.floor(argValues[0]);
            case 'ceil':
                return Math.ceil(argValues[0]);
            case 'sqrt':
                return Math.sqrt(argValues[0]);
            case 'now':
                return new Date();
            case 'date':
                return new Date(argValues[0]);
            default:
                throw new Error(`Unknown function: ${functionName}`);
        }
    }

    private hasConsecutiveOccurrences(array: any[], value: any, count: number): boolean {
        if (!Array.isArray(array)) return false;

        let consecutive = 0;
        for (const item of array) {
            if (item === value) {
                consecutive++;
                if (consecutive >= count) return true;
            } else {
                consecutive = 0;
            }
        }
        return false;
    }

    private rangesOverlap(range1: [number, number], range2: [number, number]): boolean {
        return range1[0] <= range2[1] && range2[0] <= range1[1];
    }
}
