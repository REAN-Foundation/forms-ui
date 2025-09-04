// Shared calculation-logic helpers and backend calls (UI-agnostic)

// Helper function to convert display operators to backend operators
export function toBackendOperator(displayOp: string): string {
    const operatorMap: Record<string, string> = {
        'Equal To': 'Equal',
        'Not Equal To': 'NotEqual',
        'Greater Than': 'GreaterThan',
        'Greater Than or Equal To': 'GreaterThanOrEqual',
        'Greater Than or Equal': 'GreaterThanOrEqual',
        'Less Than': 'LessThan',
        'Less Than or Equal To': 'LessThanOrEqual',
        'Less Than or Equal': 'LessThanOrEqual',
        'Contains': 'Contains',
        'Does Not Contain': 'DoesNotContain',
        'Starts With': 'Contains', // Map to Contains for now
        'Ends With': 'Contains',   // Map to Contains for now
        'Is Empty': 'Exists',
        'Is Not Empty': 'Exists',
        'Is True': 'IsTrue',
        'Is False': 'IsFalse'
    };
    return operatorMap[displayOp] || displayOp;
}

export type QuestionSection = { FormFields: any[] };

export function sanitizeSettings(settings: any) {
    const out: any = {};
    if (!settings) return out;
    const dp = (settings as any).DecimalPlaces;
    if (dp !== '' && dp !== null && dp !== undefined && !Number.isNaN(Number(dp))) {
        out.DecimalPlaces = Number(dp);
    }
    if (settings.RoundingMethod && String(settings.RoundingMethod).trim() !== '') {
        out.RoundingMethod = settings.RoundingMethod;
    }
    ['AutoUpdate', 'ShowFormula', 'AllowManualOverride'].forEach((k) => {
        if ((settings as any)[k] === true) out[k] = true;
    });
    if (settings.NumberFormat && String(settings.NumberFormat).trim() !== '') {
        out.NumberFormat = settings.NumberFormat;
    }
    return out;
}

export function mapResponseTypeToOperandDataType(rt: string): string {
    if (!rt) return 'Text';
    const v = `${rt}`.toLowerCase();
    if (v.includes('int')) return 'Integer';
    if (
        v.includes('float') ||
        v.includes('double') ||
        v.includes('decimal') ||
        v.includes('number') ||
        v.includes('currency')
    )
        return 'Float';
    if (v.includes('bool')) return 'Boolean';
    if (v.includes('date') && v.includes('time')) return 'DateTime';
    if (v.includes('date')) return 'Date';
    return 'Text';
}

export function prepareExpressionAndVariables(expr: string, questionList: QuestionSection[]) {
    const tokenRegex = /\{([a-z0-9_\-]+)\}/gi;
    const foundTokens: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(expr)) !== null) {
        const t = m[1].toLowerCase();
        if (!foundTokens.includes(t)) foundTokens.push(t);
    }

    const toHyphenSlug = (s: string) =>
        (s || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    const toVarName = (slug: string) => {
        let v = (slug || '')
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_]+/g, '_')
            .replace(/_+/g, '_');
        if (/^[^a-z_]/.test(v)) v = `v_${v}`;
        return v;
    };

    const variables: Record<string, any> = {};
    for (const token of foundTokens) {
        let matchedField: any = null;
        outer: for (const section of questionList || []) {
            for (const f of section?.FormFields || []) {
                const fSlugTitle = toHyphenSlug(f?.Title || '');
                const fSlugCode = toHyphenSlug(f?.DisplayCode || '');
                if (token === fSlugTitle || token === fSlugCode) {
                    matchedField = f;
                    break outer;
                }
            }
        }
        if (matchedField) {
            const varName = toVarName(token);
            variables[varName] = {
                Type: 'FieldReference',
                DataType: mapResponseTypeToOperandDataType(matchedField?.ResponseType),
                FieldId: matchedField?.id || ''
            };
        }
    }

    let backendExpr = expr.replace(/×/g, '*');
    for (const token of foundTokens) {
        const varName = toVarName(token);
        const re = new RegExp(`\\{${token}\\}`, 'gi');
        backendExpr = backendExpr.replace(re, varName);
    }

    return { backendExpr, variables };
}

// API functions for calculation logic operations and rules


/**
 * Create a function expression operation
 */
export async function createFunctionExpressionOperation(expr: string, ruleName: string, questionList: QuestionSection[]) {
    const { backendExpr, variables } = prepareExpressionAndVariables(expr || '', questionList);
    const payload = {
        Name: `${ruleName || 'Calculation'} - Function expression`,
        Description: `${ruleName || 'Calculation'} - Function expression`,
        Expression: backendExpr,
        Variables: JSON.stringify(variables)
    };
    const res = await fetch('/api/server/operations/function-expression-operation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.Message || 'Failed to create function expression operation');
    }
    const data = await res.json();
    return data?.Data?.id as string;
}

/**
 * Update a function expression operation
 */
export async function updateFunctionExpressionOperation(opId: string, expr: string, ruleName: string, questionList: QuestionSection[]) {
    const { backendExpr, variables } = prepareExpressionAndVariables(expr || '', questionList);
    const payload = {
        Name: `${ruleName || 'Calculation'} - Function expression`,
        Description: `${ruleName || 'Calculation'} - Function expression`,
        Expression: backendExpr,
        Variables: JSON.stringify(variables)
    };
    const res = await fetch(`/api/server/operations/function-expression-operation/${opId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.Message || 'Failed to update function expression operation');
    }
}

/**
 * Create a calculation rule
 */
export async function createCalculationRule(params: { logicId: string; conditionOperationId: string; operationType: string; ruleName?: string; ruleDescription?: string; settings?: any; ruleOutcome?: any; }) {
    const { logicId, conditionOperationId, operationType, ruleName, ruleDescription, settings, ruleOutcome } = params;
    const payload: any = {
        Name: ruleName || 'Calculation Rule',
        Description: ruleDescription || 'Field Calculation-rule Description',
        OperationType: operationType, // Use the actual operation type (Logical or Composite)
        BaseOperationId: conditionOperationId, // This is the condition operation (logical/composite)
        OperationId: conditionOperationId, // This is also the condition operation (logical/composite)
        LogicId: logicId
    };

    // Add Settings if provided
    if (settings) {
        const sanitized = sanitizeSettings(settings);
        if (Object.keys(sanitized).length > 0) {
            payload.Settings = sanitized;
        }
    }

    // Add RuleOutcome if provided
    if (ruleOutcome) {
        payload.RuleOutcome = ruleOutcome;
    }

    console.log('🔍 Service: Sending payload to API:', payload);

    const res = await fetch('/api/server/rules/calculation-rule', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.Message || 'Failed to create calculation rule');
    }
}

/**
 * Update a calculation rule
 */
export async function updateCalculationRule(params: { ruleId: string; conditionOperationId: string; operationType: string; ruleName?: string; ruleDescription?: string; settings?: any; ruleOutcome?: any; }) {
    const { ruleId, conditionOperationId, operationType, ruleName, ruleDescription, settings, ruleOutcome } = params;
    const payload: any = {
        Name: ruleName || 'Calculation Rule',
        Description: ruleDescription || 'Field Calculation-rule Description',
        OperationType: operationType, // Use the actual operation type (Logical or Composite)
        BaseOperationId: conditionOperationId,
        OperationId: conditionOperationId
    };

    // Add Settings if provided
    if (settings) {
        const sanitized = sanitizeSettings(settings);
        if (Object.keys(sanitized).length > 0) {
            payload.Settings = sanitized;
        }
    }

    // Add RuleOutcome if provided
    if (ruleOutcome) {
        payload.RuleOutcome = ruleOutcome;
    }

    const res = await fetch(`/api/server/rules/calculation-rule/${ruleId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.Message || 'Failed to update calculation rule');
    }
}

/**
 * Ensure calculation logic exists for a field
 */
export async function ensureCalculationLogic(currentField: any) {
    if (!currentField?.id) throw new Error('Missing field id');
    const res = await fetch('/api/server/logic/calculation-logic', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ FieldId: currentField.id, Enabled: true })
    });
    const data = await res.json();
    if (res.ok && data?.Data?.id) return data.Data.id as string;
    throw new Error(data?.Message || 'Failed to create calculation logic');
}

/**
 * Link calculation logic to a form field
 */
export async function linkLogicToField(currentField: any, logicId: string) {
    const payload = { id: currentField.id, CalculateLogicId: logicId } as any;
    const res = await fetch('/api/server/form-fields', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.Message || 'Failed to update form field');
    }
}


