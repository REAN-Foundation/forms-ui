/* eslint-disable no-case-declarations */
// utils.ts - Utility functions

import { OperationType, OperandType } from './enums';
import type { CompositionOperation, Form, FunctionExpressionOperation, IterateOperation, LogicalOperation, MathematicalOperation, Operation } from './interfaces';


export class FormUtils {
    static findDependentFields(form: Form, fieldId: string): Set<string> {
        const dependentFields = new Set<string>();

        for (const field of form.Fields) {
            if (field.SkipLogic) {
                if (this.operationReferencesField(field.SkipLogic.Rules.map(r => r.Operation), fieldId)) {
                    dependentFields.add(field.FieldId);
                }
            }
            if (field.CalculateLogic) {
                if (this.operationReferencesField(field.CalculateLogic.Rules.map(r => r.Operation), fieldId)) {
                    dependentFields.add(field.FieldId);
                }
            }
            if (field.ValidateLogic) {
                if (this.operationReferencesField(field.ValidateLogic.Rules.map(r => r.Operation), fieldId)) {
                    dependentFields.add(field.FieldId);
                }
            }
        }

        return dependentFields;
    }

    private static operationReferencesField(operations: Operation[], fieldId: string): boolean {
        for (const operation of operations) {
            if (this.checkOperationForFieldReference(operation, fieldId)) {
                return true;
            }
        }
        return false;
    }

    private static checkOperationForFieldReference(operation: Operation, fieldId: string): boolean {
        switch (operation.Type) {
            case OperationType.Logical:
            case OperationType.Mathematical:
                return (operation as LogicalOperation | MathematicalOperation).Operands.some(
                    operand => operand.Type === OperandType.FieldReference && operand.FieldId === fieldId
                );
            case OperationType.Composition:
                return this.operationReferencesField((operation as CompositionOperation).Children, fieldId);
            case OperationType.Iterate:
                const iterOp = operation as IterateOperation;
                if (iterOp.ArrayOperand.Type === OperandType.FieldReference && iterOp.ArrayOperand.FieldId === fieldId) {
                    return true;
                }
                return this.checkOperationForFieldReference(iterOp.Operation, fieldId);
            case OperationType.FunctionExpression:
                const funcExprOp = operation as FunctionExpressionOperation;
                return Object.values(funcExprOp.Variables).some(
                    operand => operand.Type === OperandType.FieldReference && operand.FieldId === fieldId
                );
            default:
                return false;
        }
    }

    static getFieldExecutionOrder(form: Form): string[] {
        const visited = new Set<string>();
        const order: string[] = [];

        const visit = (fieldId: string) => {
            if (visited.has(fieldId)) return;
            visited.add(fieldId);

            const dependencies = this.getFieldDependencies(form, fieldId);
            for (const dep of dependencies) {
                visit(dep);
            }

            order.push(fieldId);
        };

        for (const field of form.Fields) {
            visit(field.FieldId);
        }

        return order;
    }

    private static getFieldDependencies(form: Form, fieldId: string): Set<string> {
        const dependencies = new Set<string>();
        const field = form.Fields.find(f => f.FieldId === fieldId);

        if (!field) return dependencies;

        if (field.SkipLogic) {
            const rules = field.SkipLogic.Rules;
            for (const rule of rules) {
                this.extractFieldReferences(rule.Operation, dependencies);
            }
        }
        if (field.CalculateLogic) {
            const rules = field.CalculateLogic.Rules;
            for (const rule of rules) {
                if (rule.ConditionForOperation) {
                    this.extractFieldReferences(rule.ConditionForOperation, dependencies);
                }
                this.extractFieldReferences(rule.Operation, dependencies);
            }
        }
        if (field.ValidateLogic) {
            const rules = field.ValidateLogic.Rules;
            for (const rule of rules) {
                this.extractFieldReferences(rule.Operation, dependencies);
            }
        }

        return dependencies;
    }

    private static extractFieldReferences(operation: Operation, references: Set<string>): void {
        switch (operation.Type) {
            case OperationType.Logical:
            case OperationType.Mathematical:
                (operation as LogicalOperation | MathematicalOperation).Operands.forEach(operand => {
                    if (operand.Type === OperandType.FieldReference && operand.FieldId) {
                        references.add(operand.FieldId);
                    }
                });
                break;
            case OperationType.Composition:
                (operation as CompositionOperation).Children.forEach(child => {
                    this.extractFieldReferences(child, references);
                });
                break;
            case OperationType.Iterate:
                const iterOp = operation as IterateOperation;
                if (iterOp.ArrayOperand.Type === OperandType.FieldReference && iterOp.ArrayOperand.FieldId) {
                    references.add(iterOp.ArrayOperand.FieldId);
                }
                this.extractFieldReferences(iterOp.Operation, references);
                break;
            case OperationType.FunctionExpression:
                const funcExprOp = operation as FunctionExpressionOperation;
                Object.values(funcExprOp.Variables).forEach(operand => {
                    if (operand.Type === OperandType.FieldReference && operand.FieldId) {
                        references.add(operand.FieldId);
                    }
                });
                break;
        }
    }
}
