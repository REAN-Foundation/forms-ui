import { RuleEvaluator } from './evaluator';
import type { Form, EvaluationContext, FormField } from './interfaces';

////////////////////////////////////////////////////////////////////////////

export class FormRuleExecutor {
    private form: Form;
    private fieldValues: Map<string, any>;

    constructor(form: Form) {
        this.form = form;
        this.fieldValues = new Map();

        // Initialize field values
        form.Fields.forEach(field => {
            if (field.Value !== undefined) {
                this.fieldValues.set(field.FieldId, field.Value);
            }
        });
    }

    setFieldValue(fieldId: string, value: any): void {
        this.fieldValues.set(fieldId, value);
    }

    getFieldValue(fieldId: string): any {
        return this.fieldValues.get(fieldId);
    }

    executeFieldLogics(fieldId: string): {
        shouldSkip: boolean;
        calculatedValue?: any;
        validationErrors: string[];
    } {
        const field = this.form.Fields.find(f => f.FieldId === fieldId);
        if (!field) {
            throw new Error(`Field with id ${fieldId} not found`);
        }

        const context: EvaluationContext = {
            Form: this.form,
            CurrentFieldId: fieldId,
            FieldValues: this.fieldValues
        };

        const evaluator = new RuleEvaluator(context);

        let shouldSkip = false;
        let calculatedValue: any;
        const validationErrors: string[] = [];

        if (field.SkipLogic) {
            const result = evaluator.evaluateSkipLogic(field.SkipLogic);
            if (result.ShouldSkip) {
                shouldSkip = true;
            }
        }

        if (field.CalculateLogic) {
            const result = evaluator.evaluateCalculationLogic(field.CalculateLogic);
            if (result.Success && result.Value !== undefined) {
                calculatedValue = result.Value;
                this.setFieldValue(fieldId, calculatedValue);
            }
        }

        if (field.ValidateLogic) {
            const result = evaluator.evaluateValidationLogic(field.ValidateLogic);
            if (!result.IsValid) {
                validationErrors.push(...result.Errors);
            }
        }

        return { shouldSkip, calculatedValue, validationErrors };
    }

    executeAllFieldLogics(): Map<string, {
        shouldSkip: boolean;
        calculatedValue?: any;
        validationErrors: string[];
    }> {
        const results = new Map();

        for (const field of this.form.Fields) {
            const result = this.executeFieldLogics(field.FieldId);
            results.set(field.FieldId, result);
        }

        return results;
    }

    getVisibleFields(): FormField[] {
        const visibleFields: FormField[] = [];

        for (const field of this.form.Fields) {
            const result = this.executeFieldLogics(field.FieldId);
            if (!result.shouldSkip) {
                visibleFields.push(field);
            }
        }

        return visibleFields;
    }

    validateForm(): { isValid: boolean; errors: Map<string, string[]>; } {
        const errors = new Map<string, string[]>();
        let isValid = true;

        console.log('🔍 Validating form with fields:', this.form.Fields.map(f => ({ id: f.FieldId, hasValidateLogic: !!f.ValidateLogic })));

        for (const field of this.form.Fields) {
            console.log(`🔍 Validating field ${field.FieldId}:`, {
                hasValidateLogic: !!field.ValidateLogic,
                validateLogic: field.ValidateLogic
            });

            const result = this.executeFieldLogics(field.FieldId);
            console.log(`🔍 Field ${field.FieldId} validation result:`, result);

            if (result.validationErrors.length > 0) {
                errors.set(field.FieldId, result.validationErrors);
                isValid = false;
                console.log(`🔍 Field ${field.FieldId} has validation errors:`, result.validationErrors);
            }

            // Check required fields
            if (field.Required && !result.shouldSkip) {
                const value = this.getFieldValue(field.FieldId);
                if (value === null || value === undefined || value === '') {
                    const fieldErrors = errors.get(field.FieldId) || [];
                    fieldErrors.push(`${field.Label} is required`);
                    errors.set(field.FieldId, fieldErrors);
                    isValid = false;
                }
            }
        }

        return { isValid, errors };
    }

    executeField(field: FormField): { isValid: boolean; errors: string[]; } {

        const errors: string[] = [];
        let isValid = true;

        const result = this.executeFieldLogics(field.FieldId);

        if (result.validationErrors.length > 0) {
            errors.push(...result.validationErrors);
            isValid = false;
        }

        // Check required fields
        if (field.Required && !result.shouldSkip) {
            const value = this.getFieldValue(field.FieldId);
            if (value === null || value === undefined || value === '') {
                errors.push(`${field.Label} is required`);
                isValid = false;
            }
        }

        return { isValid, errors };
    }
}
