// serialization.ts - For JSON storage and transfer

import type {
    Operation,
    Logic,
    Rule,
    SkipLogic,
    CalculationLogic,
    ValidationLogic,
    SkipRule,
    CalculationRule,
    ValidationRule,
    FormField,
    Form
} from './interfaces';

export class FormLogicSerializer {

    // Operation serialization
    static serializeOperation(operation: Operation): string {
        return JSON.stringify(operation);
    }

    static deserializeOperation(operationJson: string): Operation {
        return JSON.parse(operationJson);
    }

    // Rule serialization
    static serializeRule(rule: Rule | SkipRule | CalculationRule | ValidationRule): string {
        return JSON.stringify(rule);
    }

    static deserializeRule(ruleJson: string): Rule | SkipRule | CalculationRule | ValidationRule {
        return JSON.parse(ruleJson);
    }

    // Logic serialization
    static serializeLogic(logic: Logic | SkipLogic | CalculationLogic | ValidationLogic): string {
        return JSON.stringify(logic);
    }

    static deserializeLogic(logicJson: string): Logic | SkipLogic | CalculationLogic | ValidationLogic {
        return JSON.parse(logicJson);
    }

    // FormField serialization
    static serializeFormField(field: FormField): string {
        return JSON.stringify(field);
    }

    static deserializeFormField(fieldJson: string): FormField {
        return JSON.parse(fieldJson);
    }

    // Form serialization
    static serializeForm(form: Form): string {
        return JSON.stringify(form);
    }

    static deserializeForm(formJson: string): Form {
        return JSON.parse(formJson);
    }

    // Batch operations for arrays
    static serializeOperations(operations: Operation[]): string {
        return JSON.stringify(operations);
    }

    static deserializeOperations(operationsJson: string): Operation[] {
        return JSON.parse(operationsJson);
    }

    static serializeRules(rules: (Rule | SkipRule | CalculationRule | ValidationRule)[]): string {
        return JSON.stringify(rules);
    }

    static deserializeRules(rulesJson: string): (Rule | SkipRule | CalculationRule | ValidationRule)[] {
        return JSON.parse(rulesJson);
    }

    static serializeLogics(logics: (Logic | SkipLogic | CalculationLogic | ValidationLogic)[]): string {
        return JSON.stringify(logics);
    }

    static deserializeLogics(logicsJson: string): (Logic | SkipLogic | CalculationLogic | ValidationLogic)[] {
        return JSON.parse(logicsJson);
    }

    static serializeFormFields(fields: FormField[]): string {
        return JSON.stringify(fields);
    }

    static deserializeFormFields(fieldsJson: string): FormField[] {
        return JSON.parse(fieldsJson);
    }

    static serializeForms(forms: Form[]): string {
        return JSON.stringify(forms);
    }

    static deserializeForms(formsJson: string): Form[] {
        return JSON.parse(formsJson);
    }

    // Utility methods for safe serialization with error handling
    static safeSerialize(obj: any): string | null {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            console.error('Serialization error:', error);
            return null;
        }
    }

    static safeDeserialize<T>(json: string): T | null {
        try {
            return JSON.parse(json) as T;
        } catch (error) {
            console.error('Deserialization error:', error);
            return null;
        }
    }

    // Pretty printing for debugging
    static prettySerialize(obj: any): string {
        return JSON.stringify(obj, null, 2);
    }
}
