import { RuleEvaluator } from './evaluator';
import { FallbackRuleExecutor } from './fallback-executor';
import type { Form, EvaluationContext, FormField } from './interfaces';
import type { FallbackRule, FallbackRuleContext } from './types/fallback-rule';

////////////////////////////////////////////////////////////////////////////

export class FormRuleExecutor {
    private form: Form;
    private fieldValues: Map<string, any>;
    private fallbackExecutor: FallbackRuleExecutor;

    constructor(form: Form, fallbackRules: FallbackRule[] = []) {
        this.form = form;
        this.fieldValues = new Map();
        this.fallbackExecutor = new FallbackRuleExecutor(fallbackRules);

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

    /**
     * Add or update fallback rules
     */
    addFallbackRules(fallbackRules: FallbackRule[]): void {
        fallbackRules.forEach(rule => {
            this.fallbackExecutor.addFallbackRule(rule);
        });
    }

    /**
     * Execute fallback rules for a specific operation
     */
    async executeFallbackRulesForOperation(
        baseOperationId: string,
        fieldId: string,
        error?: Error
    ): Promise<any> {
        const context: FallbackRuleContext = {
            fieldId,
            currentValue: this.getFieldValue(fieldId),
            formData: Object.fromEntries(this.fieldValues),
            error,
            retryCount: 0
        };

        const results = await this.fallbackExecutor.executeFallbackRulesForOperation(
            baseOperationId,
            context
        );

        // Process the results and apply actions
        for (const result of results) {
            if (result.success) {
                switch (result.action) {
                    case 'SET_DEFAULT':
                        if (result.value !== undefined) {
                            this.setFieldValue(fieldId, result.value);
                        }
                        break;
                    case 'CLEAR_FIELD':
                        this.setFieldValue(fieldId, '');
                        break;
                    case 'DISABLE_FIELD':
                        // This would need to be handled by the UI component
                        console.log(`Field ${fieldId} should be disabled`);
                        break;
                }
            }
        }

        return results;
    }

    async executeFieldLogics(fieldId: string): Promise<{
        shouldSkip: boolean;
        calculatedValue?: any;
        validationErrors: string[];
        fallbackResults?: any[];
    }> {
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
        let fallbackResults: any[] = [];

        try {
            if (field.SkipLogic) {
                const result = evaluator.evaluateSkipLogic(field.SkipLogic);
                if (result.ShouldSkip) {
                    shouldSkip = true;
                }

                // Execute fallback rules for skip logic if there's an error
                if (result.MatchedRule?.FallbackRuleId) {
                    const fallbackResult = await this.fallbackExecutor.executeFallbackRule(
                        result.MatchedRule.FallbackRuleId,
                        {
                            fieldId,
                            currentValue: this.getFieldValue(fieldId),
                            formData: Object.fromEntries(this.fieldValues)
                        }
                    );
                    fallbackResults.push(fallbackResult);
                }
            }

            if (field.CalculateLogic) {
                const result = evaluator.evaluateCalculationLogic(field.CalculateLogic);
                if (result.Success && result.Value !== undefined) {
                    // Decide whether to apply calculated value based on settings
                    let autoUpdate = false;
                    let allowManualOverride = true;
                    try {
                        type MaybeHasSettings = { Settings?: unknown };
                        const matchedRuleWithSettings = result.MatchedRule as unknown as MaybeHasSettings | undefined;
                        const logicWithSettings = field.CalculateLogic as unknown as MaybeHasSettings | undefined;
                        const ruleSettingsRaw = matchedRuleWithSettings?.Settings ?? logicWithSettings?.Settings;
                        if (typeof ruleSettingsRaw === 'string') {
                            const parsed = JSON.parse(ruleSettingsRaw);
                            autoUpdate = parsed?.AutoUpdate === true;
                            allowManualOverride = parsed?.AllowManualOverride !== false;
                        } else if (typeof ruleSettingsRaw === 'object' && ruleSettingsRaw !== null) {
                            autoUpdate = (ruleSettingsRaw as any).AutoUpdate === true;
                            allowManualOverride = (ruleSettingsRaw as any).AllowManualOverride !== false;
                        }
                    } catch { }

                    const currentValue = this.getFieldValue(fieldId);
                    const isEmpty = currentValue === null || currentValue === undefined || currentValue === '';

                    // Apply rules:
                    // - If AutoUpdate true:
                    //   - If AllowManualOverride true: only set when current is empty
                    //   - If AllowManualOverride false: always set
                    // - If AutoUpdate false: set only when current is empty
                    const shouldSet = autoUpdate
                        ? (allowManualOverride ? isEmpty : true)
                        : isEmpty;

                    if (shouldSet) {
                        calculatedValue = result.Value;
                        this.setFieldValue(fieldId, calculatedValue);
                    }
                } else if (result.Error) {
                    // Execute fallback rules for calculation logic if there's an error
                    if (result.MatchedRule?.FallbackRuleId) {
                        const fallbackResult = await this.fallbackExecutor.executeFallbackRule(
                            result.MatchedRule.FallbackRuleId,
                            {
                                fieldId,
                                currentValue: this.getFieldValue(fieldId),
                                formData: Object.fromEntries(this.fieldValues),
                                error: new Error(result.Error)
                            }
                        );
                        fallbackResults.push(fallbackResult);
                    }
                }
            }

            if (field.ValidateLogic) {
                const result = evaluator.evaluateValidationLogic(field.ValidateLogic);
                if (!result.IsValid) {
                    validationErrors.push(...result.Errors);

                    // Execute fallback rules for validation logic if there are errors
                    for (const failedRule of result.FailedRules) {
                        if (failedRule.FallbackRuleId) {
                            const fallbackResult = await this.fallbackExecutor.executeFallbackRule(
                                failedRule.FallbackRuleId,
                                {
                                    fieldId,
                                    currentValue: this.getFieldValue(fieldId),
                                    formData: Object.fromEntries(this.fieldValues),
                                    error: new Error(failedRule.ErrorMessage)
                                }
                            );
                            fallbackResults.push(fallbackResult);
                        }
                    }
                }
            }
        } catch (error) {
            // Execute fallback rules for any general errors
            const fallbackResult = await this.executeFallbackRulesForOperation(
                'general',
                fieldId,
                error as Error
            );
            fallbackResults.push(...fallbackResult);
        }

        return { shouldSkip, calculatedValue, validationErrors, fallbackResults };
    }

    async executeAllFieldLogics(): Promise<Map<string, {
        shouldSkip: boolean;
        calculatedValue?: any;
        validationErrors: string[];
        fallbackResults?: any[];
    }>> {
        const results = new Map();

        for (const field of this.form.Fields) {
            const result = await this.executeFieldLogics(field.FieldId);
            results.set(field.FieldId, result);
        }

        return results;
    }

    async getVisibleFields(): Promise<FormField[]> {
        const visibleFields: FormField[] = [];

        for (const field of this.form.Fields) {
            const result = await this.executeFieldLogics(field.FieldId);
            if (!result.shouldSkip) {
                visibleFields.push(field);
            }
        }

        return visibleFields;
    }

    async validateForm(): Promise<{ isValid: boolean; errors: Map<string, string[]>; }> {
        const errors = new Map<string, string[]>();
        let isValid = true;

        console.log('🔍 Validating form with fields:', this.form.Fields.map(f => ({ id: f.FieldId, hasValidateLogic: !!f.ValidateLogic })));

        for (const field of this.form.Fields) {
            console.log(`🔍 Validating field ${field.FieldId}:`, {
                hasValidateLogic: !!field.ValidateLogic,
                validateLogic: field.ValidateLogic
            });

            const result = await this.executeFieldLogics(field.FieldId);
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

    async executeField(field: FormField): Promise<{ isValid: boolean; errors: string[]; }> {

        const errors: string[] = [];
        let isValid = true;

        const result = await this.executeFieldLogics(field.FieldId);

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
