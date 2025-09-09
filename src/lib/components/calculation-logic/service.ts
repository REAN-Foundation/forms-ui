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
		'Starts With': 'Contains', // Map to Contains since StartsWith is not supported
		'Ends With': 'Contains', // Map to Contains since EndsWith is not supported
		'Is Empty': 'Exists', // Map to Exists and handle negation in logic
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

// Utility Functions

// Get operators based on field data type
// Input: Field data type (QueryResponseType enum value)
// Output: Array of appropriate operators for that data type
export function getOperatorsForDataType(dataType: string): string[] {
	switch (dataType) {
		// Text fields - string operations
		case 'Text':
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// Text Array - array operations
		case 'TextArray':
			return [
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// Numeric fields - comparison operations
		case 'Integer':
		case 'Float':
		case 'Rating':
		case 'Range':
			return [
				'Equal To',
				'Not Equal To',
				'Greater Than',
				'Less Than',
				'Greater Than or Equal',
				'Less Than or Equal',
				'Is Empty',
				'Is Not Empty'
			];

		// Boolean fields - boolean operations
		case 'Boolean':
			return [
				'Equal To',
				'Not Equal To',
				'Is True',
				'Is False'
			];

		// Date/Time fields - temporal operations
		case 'Date':
		case 'DateTime':
			return [
				'Equal To',
				'Not Equal To',
				'Greater Than',
				'Less Than',
				'Greater Than or Equal',
				'Less Than or Equal',
				'Is Empty',
				'Is Not Empty'
			];

		// Selection fields - choice operations
		case 'SingleChoiceSelection':
		case 'MultiChoiceSelection':
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// URL fields - string operations with URL-specific logic
		case 'Url':
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// Location fields - geographic operations
		case 'Location':
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// File fields - file operations
		case 'File':
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];

		// Object fields - object operations
		case 'Object':
			return [
				'Equal To',
				'Not Equal To',
				'Is Empty',
				'Is Not Empty'
			];

		// Default fallback for unknown types
		default:
			return [
				'Equal To',
				'Not Equal To',
				'Contains',
				'Does Not Contain',
				'Is Empty',
				'Is Not Empty'
			];
	}
}

// Get all available fields from questionList (flattened)
// Returns: Array of all form fields from all sections
export function getAllFields(questionList: QuestionSection[]): any[] {
	const allFields = [];
	for (const section of questionList || []) {
		for (const field of section.FormFields || []) {
			allFields.push(field);
		}
	}
	return allFields;
}

// Format field title with hyphens for consistent display
// Input: Field title string
// Output: Formatted title with hyphens replacing spaces and special chars
export function formatFieldTitle(title: string): string {
	if (!title) return '';
	return title
		.replace(/\s+/g, '-')
		.replace(/[^\w\-?.,!@#$%^&*()]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// Get field display name for UI
// Input: Field ID and question list
// Output: Formatted display name (Title > DisplayCode > ID)
export function getFieldDisplay(fieldId: string, questionList: QuestionSection[]): string {
	const allFields = getAllFields(questionList);
	const field = allFields.find((f) => f.id === fieldId);
	const label = field?.Title || field?.DisplayCode || field?.id || fieldId;
	return formatFieldTitle(label) || fieldId;
}

// Get field ID from display name
// Input: Display name string and question list
// Output: Field ID or original display name if not found
export function getFieldIdFromDisplay(displayName: string, questionList: QuestionSection[]): string {
	const field = getAllFields(questionList).find((f) =>
		f.Title === displayName || f.DisplayCode === displayName
	);
	return field ? field.id : displayName;
}

// Get current operators based on selected field
// Returns: Array of operators for the currently selected field
export function getCurrentOperators(logicalConditionField: string, questionList: QuestionSection[]): string[] {
	if (!logicalConditionField) {
		return [
			'Equal To',
			'Not Equal To',
			'Contains',
			'Does Not Contain',
			'Is Empty',
			'Is Not Empty'
		];
	}

	const selectedField = getAllFields(questionList).find(
		(field) =>
			field.id === logicalConditionField ||
			field.Title === logicalConditionField ||
			field.DisplayCode === logicalConditionField
	);

	if (!selectedField) {
		return [
			'Equal To',
			'Not Equal To',
			'Contains',
			'Does Not Contain',
			'Is Empty',
			'Is Not Empty'
		];
	}

	return getOperatorsForDataType(selectedField.ResponseType);
}

// Map backend operators back to display names
// Input: Backend operator string
// Output: Display-friendly operator name
export function mapBackendOperatorToDisplay(backendOp: string): string {
	const operatorMap: Record<string, string> = {
		Equal: 'Equal To',
		NotEqual: 'Not Equal To',
		GreaterThan: 'Greater Than',
		GreaterThanOrEqual: 'Greater Than or Equal',
		LessThan: 'Less Than',
		LessThanOrEqual: 'Less Than or Equal',
		Contains: 'Contains',
		DoesNotContain: 'Does Not Contain',
		Exists: 'Is Not Empty',
		IsTrue: 'Is True',
		IsFalse: 'Is False'
	};
	return operatorMap[backendOp] || backendOp;
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
		BaseOperationId: conditionOperationId || null,
		OperationId: conditionOperationId || null
    };

    // Add Settings if provided
    if (settings) {
        const sanitized = sanitizeSettings(settings);
        if (Object.keys(sanitized).length > 0) {
            payload.Settings = sanitized;
        }
    }

	// Always add RuleOutcome (can be null to clear it)
	payload.RuleOutcome = ruleOutcome;

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

// Form Management Functions

// Reset form for create mode
// Output: All form fields reset to default values
export function getResetForCreateState() {
	return {
		ruleName: '',
		ruleDescription: '',
		useConditionalLogic: false,
		conditionMode: 'composite' as 'logical' | 'composite',
		outcomeMode: 'expression' as 'static' | 'expression',
		staticValue: '',
		staticValueDataType: 'Text',
		logicalConditionName: '',
		logicalConditionField: '',
		logicalConditionOperator: '',
		logicalConditionValue: '',
		tree: { type: 'composite', operator: 'AND', children: [] },
		expressions: { global: '0' },
		decimalPlaces: '2',
		roundingMethod: 'Round to nearest',
		autoUpdate: false,
		showFormula: false,
		allowManualOverride: false,
		numberFormat: 'number',
		updateOperations: false
	};
}

// Reset form state for editing (clears previous rule data)
// Output: All form fields reset to default values for editing mode
export function getResetFormState() {
	return {
		ruleName: '',
		ruleDescription: '',
		useConditionalLogic: false,
		conditionMode: 'logical' as 'logical' | 'composite',
		logicalConditionField: '',
		logicalConditionOperator: 'Equal To',
		logicalConditionValue: '',
		logicalConditionName: '',
		outcomeMode: 'expression' as 'static' | 'expression',
		staticValue: '',
		staticValueDataType: 'Text',
		decimalPlaces: '2',
		roundingMethod: 'Round to nearest',
		autoUpdate: false,
		showFormula: false,
		allowManualOverride: false,
		numberFormat: 'number',
		collapsed: {},
		expressions: { global: '0' },
		tree: { type: 'composite', operator: 'AND', children: [] },
		updateOperations: false
	};
}

// Operation Parsing Functions

// Parse and populate a single logical operation
// Input: Logical operation object
// Output: Form fields populated with operation data
export function parseAndPopulateOperation(operation: any) {
	const result = {
		useConditionalLogic: true,
		conditionMode: 'logical' as 'logical' | 'composite',
		logicalConditionField: '',
		logicalConditionOperator: 'Equal To',
		logicalConditionValue: '',
		logicalConditionName: ''
	};

	// Parse operands to extract field, operator, value
	if (operation.Operands) {
		const operands = JSON.parse(operation.Operands);

		// Extract field information
		if (operands[0] && operands[0].Type === 'FieldReference') {
			result.logicalConditionField = operands[0].FieldId || '';
		}

		// Map operator back to display name
		result.logicalConditionOperator = mapBackendOperatorToDisplay(operation.Operator);

		// Extract value
		if (operands[1] && operands[1].Type === 'Constant') {
			result.logicalConditionValue = operands[1].Value || '';
		}

		// Set condition name
		result.logicalConditionName = operation.Name || '';
	}

	return result;
}

// Create a synchronous logical node from operation data
// Input: Logical operation object
// Output: Tree node object for logical condition
export function createLogicalNodeFromOperation(operation: any, questionList: QuestionSection[]) {
	let field = '';
	let value = '';
	let operator = 'Equal To';

	// Parse operands to extract field, operator, value
	if (operation.Operands) {
		const operands = JSON.parse(operation.Operands);

		// Extract field information - using same approach as validation logic
		if (operands[0] && operands[0].Type === 'FieldReference') {
			// Find the field in questionList using same logic as validation
			let fieldTitle = '';

			if (questionList) {
				for (const section of questionList) {
					for (const field of section.FormFields || []) {
						if (
							field.id === operands[0].FieldId ||
							field.DisplayCode === operands[0].FieldCode
						) {
							// Use Title if available, otherwise use DisplayCode, otherwise use ID
							fieldTitle = field.Title || field.DisplayCode || field.id;
							break;
						}
					}
					if (fieldTitle) break;
				}
			}

			field = fieldTitle ? formatFieldTitle(fieldTitle) : operands[0].FieldId || '';
		}

		// Map operator back to display name
		operator = mapBackendOperatorToDisplay(operation.Operator);

		// Extract value
		if (operands[1] && operands[1].Type === 'Constant') {
			value = operands[1].Value || '';
		}
	}

	return {
		type: 'logical',
		condition: {
			field,
			operator,
			value,
			name: operation.Name || ''
		}
	};
}

// Create a composite node from operation data (handles nested composite operations)
// Input: Composite operation object and original rule
// Output: Tree node object for composite condition
export function createCompositeNodeFromOperation(operation: any, originalRule: any, questionList: QuestionSection[]) {
	// Parse children from the operation - Children contains full operation objects
	let childOperations: any[] = [];
	if (operation.Children) {
		if (typeof operation.Children === 'string') {
			try {
				childOperations = JSON.parse(operation.Children);
			} catch (e) {
				childOperations = [];
			}
		} else if (Array.isArray(operation.Children)) {
			childOperations = operation.Children;
		}
	}

	// Recursively create child nodes from actual child operations
	const children = childOperations.map((childOp) => {
		// Check if this is a logical or composite operation
		if (childOp.Type === 'Logical') {
			return createLogicalNodeFromOperation(childOp, questionList);
		} else if (childOp.Type === 'Composition') {
			return createCompositeNodeFromOperation(childOp, originalRule, questionList);
		} else {
			return createLogicalNodeFromOperation(childOp, questionList);
		}
	});

	return {
		type: 'composite',
		operator: operation.Operator || 'AND',
		children: children
	};
}

// Update logical operation via PUT request with current UI values
// Input: Operation ID to update
// Output: Success/error response
export async function updateLogicalOperationById(
	operationId: string,
	condition: { field: string, operator: string, value: string, name: string },
	ruleName: string,
	ruleDescription: string,
	questionList: QuestionSection[]
): Promise<void> {
	// Validate that required fields are provided
	if (!condition.field || !condition.field.trim() || !condition.operator || !condition.operator.trim()) {
		throw new Error('Condition field and operator are required for logical operations');
	}

	// Find selected field
	const selectedField = getAllFields(questionList).find(
		(field) =>
			field.id === condition.field ||
			field.Title === condition.field ||
			field.DisplayCode === condition.field
	);
	if (!selectedField) {
		throw new Error('Selected field not found');
	}

	const operatorType = toBackendOperator(condition.operator);
	let operands: any[] = [];

	if (condition.operator === 'Is Empty' || condition.operator === 'Is Not Empty') {
		operands = [
			{
				Type: 'FieldReference',
				DataType: selectedField?.ResponseType || 'Text',
				FieldId: selectedField?.id || '',
				FieldCode: selectedField?.DisplayCode || ''
			}
		];
	} else {
		operands = [
			{
				Type: 'FieldReference',
				DataType: selectedField?.ResponseType || 'Text',
				FieldId: selectedField?.id || '',
				FieldCode: selectedField?.DisplayCode || ''
			},
			{ Type: 'Constant', DataType: 'Text', Value: condition.value || '' }
		];
	}

	const operationData = {
		Name: condition.name && condition.name.trim().length > 0
			? condition.name
			: `${ruleName} - Logical condition`,
		Description: `${ruleDescription} - Logical calculation condition`,
		Operator: operatorType,
		Operands: JSON.stringify(operands)
	};

	// Make PUT request to update the operation
	const res = await fetch(`/api/server/operations/logical-operation/${operationId}`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(operationData)
	});

	if (!res.ok) {
		const d = await res.json();
		throw new Error(d?.Message || 'Failed to update logical operation');
	}
}

// Update logical operation with current UI values (for rule updates)
// Input: Existing operation ID (optional)
// Output: Updated operation ID
export async function updateLogicalOperation(
	existingOperationId: string | null,
	condition: { field: string, operator: string, value: string, name: string },
	ruleName: string,
	ruleDescription: string,
	questionList: QuestionSection[]
): Promise<string> {
	// Validate that required fields are provided
	if (!condition.field || !condition.field.trim() || !condition.operator || !condition.operator.trim()) {
		throw new Error('Condition field and operator are required for logical operations');
	}

	// Find selected field
	const selectedField = getAllFields(questionList).find(
		(field) =>
			field.id === condition.field ||
			field.Title === condition.field ||
			field.DisplayCode === condition.field
	);
	if (!selectedField) {
		throw new Error('Selected field not found');
	}

	const operatorType = toBackendOperator(condition.operator);
	let operands: any[] = [];

	if (condition.operator === 'Is Empty' || condition.operator === 'Is Not Empty') {
		operands = [
			{
				Type: 'FieldReference',
				DataType: selectedField?.ResponseType || 'Text',
				FieldId: selectedField?.id || '',
				FieldCode: selectedField?.DisplayCode || ''
			}
		];
	} else {
		operands = [
			{
				Type: 'FieldReference',
				DataType: selectedField?.ResponseType || 'Text',
				FieldId: selectedField?.id || '',
				FieldCode: selectedField?.DisplayCode || ''
			},
			{ Type: 'Constant', DataType: 'Text', Value: condition.value || '' }
		];
	}

	const operationData = {
		Name: condition.name && condition.name.trim().length > 0
			? condition.name
			: `${ruleName} - Logical condition`,
		Description: `${ruleDescription} - Logical calculation condition`,
		Operator: operatorType,
		Operands: JSON.stringify(operands)
	};

	if (existingOperationId) {
		// Update existing operation
		const res = await fetch(`/api/server/operations/logical-operation/${existingOperationId}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(operationData)
		});

		if (!res.ok) {
			const d = await res.json();
			throw new Error(d?.Message || 'Failed to update logical operation');
		}

		return existingOperationId;
	} else {
		// Create new operation
		const logicalOperation = {
			...operationData,
			Type: 'Logical'
		};

		const logicalResponse = await fetch('/api/server/operations/logical-operation', {
			method: 'POST',
			body: JSON.stringify(logicalOperation),
			headers: { 'content-type': 'application/json' }
		});

		if (!logicalResponse.ok) {
			const errorData = await logicalResponse.json();
			throw new Error(errorData.Message || 'Failed to create logical operation');
		}

		const logicalData = await logicalResponse.json();
		return logicalData.Data.id as string;
	}
}

// Tree Manipulation Functions

// Add a logical condition to the tree at specified path
// Input: Tree object, path array, and new condition data
// Output: Updated tree object
export function addLogicalToTree(tree: any, path: number[]): any {
	const newCondition = {
		type: 'logical',
		condition: {
			field: '',
			operator: 'Equal To',
			value: '',
			name: ''
		}
	};

	const target = getNodeAtPath(tree, path);
	if (target?.type === 'composite') {
		target.children.push(newCondition);
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Add a composite group to the tree at specified path
// Input: Tree object, path array, and operator
// Output: Updated tree object
export function addGroupToTree(tree: any, path: number[], operator: 'AND' | 'OR' = 'AND'): any {
	const newGroup = {
		type: 'composite',
		operator,
		children: []
	};

	const target = getNodeAtPath(tree, path);
	if (target?.type === 'composite') {
		target.children.push(newGroup);
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Remove a node from the tree at specified path
// Input: Tree object and path array
// Output: Updated tree object
export function removeNodeFromTree(tree: any, path: number[]): any {
	if (path.length === 0) return tree; // Can't remove root

	const parentPath = path.slice(0, -1);
	const index = path[path.length - 1];
	const parent = getNodeAtPath(tree, parentPath);

	if (parent?.type === 'composite' && parent.children) {
		parent.children.splice(index, 1);
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Get node at specified path in tree
// Input: Tree node and path array
// Output: Node at path or null
export function getNodeAtPath(node: any, path: number[]): any {
	let current = node;
	for (const index of path) {
		if (current?.type === 'composite' && current.children?.[index]) {
			current = current.children[index];
		} else {
			return null;
		}
	}
	return current;
}

// Update group operator at specified path
// Input: Tree object, path array, and new operator
// Output: Updated tree object
export function updateGroupOperatorInTree(tree: any, path: number[], operator: 'AND' | 'OR'): any {
	const node = getNodeAtPath(tree, path);
	if (node?.type === 'composite') {
		node.operator = operator;
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Update leaf field at specified path
// Input: Tree object, path array, and new field value
// Output: Updated tree object
export function updateLeafFieldInTree(tree: any, path: number[], field: string): any {
	const node = getNodeAtPath(tree, path);
	if (node?.type === 'logical') {
		node.condition.field = field;
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Update leaf operator at specified path
// Input: Tree object, path array, and new operator value
// Output: Updated tree object
export function updateLeafOperatorInTree(tree: any, path: number[], operator: string): any {
	const node = getNodeAtPath(tree, path);
	if (node?.type === 'logical') {
		node.condition.operator = operator;
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Update leaf value at specified path
// Input: Tree object, path array, and new value
// Output: Updated tree object
export function updateLeafValueInTree(tree: any, path: number[], value: string): any {
	const node = getNodeAtPath(tree, path);
	if (node?.type === 'logical') {
		node.condition.value = value;
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Update leaf name at specified path
// Input: Tree object, path array, and new name
// Output: Updated tree object
export function updateLeafNameInTree(tree: any, path: number[], name: string): any {
	const node = getNodeAtPath(tree, path);
	if (node?.type === 'logical') {
		node.condition.name = name;
		return { ...tree }; // Return new tree to trigger reactivity
	}
	return tree;
}

// Toggle collapse state for a path
// Input: Collapsed state object and path array
// Output: Updated collapsed state object
export function toggleCollapseForPath(collapsed: Record<string, boolean>, path: number[]): Record<string, boolean> {
	const key = path.join('-');
	return { ...collapsed, [key]: !collapsed[key] };
}

// Form Management Functions

// Reset operator when field changes to ensure valid operator is selected
// Input: Current field, operator, and question list
// Output: Updated operator value
export function resetOperatorForCurrentField(
	logicalConditionField: string,
	logicalConditionOperator: string,
	questionList: QuestionSection[]
): string {
	const availableOperators = getCurrentOperators(logicalConditionField, questionList);

	// If current operator is not valid for the selected field, reset to first available operator
	if (logicalConditionOperator && !availableOperators.includes(logicalConditionOperator)) {
		return availableOperators[0] || 'Equal To';
	}
	return logicalConditionOperator;
}

// Parse existing operation data from originalRule
// Input: Original rule object and question list
// Output: Parsed operation data
export function parseExistingOperationData(originalRule: any, questionList: QuestionSection[]) {
	try {
		const operation = originalRule.Operation;
		if (!operation) {
			return null;
		}

		// Parse logical operation
		if (originalRule.OperationType === 'Logical') {
			return parseAndPopulateOperation(operation);
		}
		// Parse composition operation
		else if (originalRule.OperationType === 'Composition') {
			return parseExistingCompositionOperation(operation, originalRule, questionList);
		}
		return null;
	} catch (error) {
		return null;
	}
}

// Parse existing composition operation data
// Input: Operation object, original rule, and question list
// Output: Parsed composition operation data
export function parseExistingCompositionOperation(operation: any, originalRule: any, questionList: QuestionSection[]) {
	// Parse children from the operation - Children contains full operation objects, not just IDs
	let childOperations: any[] = [];
	if (operation.Children) {
		if (typeof operation.Children === 'string') {
			try {
				childOperations = JSON.parse(operation.Children);
			} catch (e) {
				childOperations = [];
			}
		} else if (Array.isArray(operation.Children)) {
			childOperations = operation.Children;
		}
	}

	// Build tree from child operations
	let tree: any;
	if (childOperations.length === 0) {
		// No children, create empty composite structure
		tree = {
			type: 'composite',
			operator: operation.Operator || 'AND',
			children: []
		};
	} else {
		// Create children directly from the child operations
		const children = childOperations.map((childOp) => {
			if (childOp.Type === 'Logical') {
				return createLogicalNodeFromOperation(childOp, questionList);
			} else if (childOp.Type === 'Composition') {
				return createCompositeNodeFromOperation(childOp, originalRule, questionList);
			} else {
				return createLogicalNodeFromOperation(childOp, questionList);
			}
		});

		tree = {
			type: 'composite',
			operator: operation.Operator || 'AND',
			children: children
		};
	}

	const logicalConditionName = operation.Name || 'Composition Operation';

	// For composite operations, populate the form fields with the first logical condition's data
	let logicalConditionField = '';
	let logicalConditionOperator = 'Equal To';
	let logicalConditionValue = '';

	if (tree.children && tree.children.length > 0) {
		const firstLogicalChild = tree.children.find((child: any) => child.type === 'logical');
		if (firstLogicalChild && firstLogicalChild.condition) {
			// Convert field display name back to field ID for the form
			logicalConditionField = getFieldIdFromDisplay(firstLogicalChild.condition.field, questionList) || '';
			logicalConditionOperator = firstLogicalChild.condition.operator || 'Equal To';
			logicalConditionValue = firstLogicalChild.condition.value || '';
		}
	}

	return {
		useConditionalLogic: true,
		conditionMode: 'composite' as 'logical' | 'composite',
		tree,
		logicalConditionName,
		logicalConditionField,
		logicalConditionOperator,
		logicalConditionValue
	};
}

// Initialize editing mode with existing rule data
// Input: Editing rule object and question list
// Output: Parsed rule data for form initialization
export function initializeEditingData(editingRule: any, questionList: QuestionSection[]) {
	if (!editingRule) return null;

	try {
		const originalRule = editingRule.originalRule || editingRule;

		// Load basic rule data
		const ruleName = originalRule.Name || '';
		const ruleDescription = originalRule.Description || '';

		// Load settings - handle both object and JSON string formats
		const settings = originalRule.Settings || {};
		let parsedSettings = settings;
		if (typeof settings === 'string') {
			try {
				parsedSettings = JSON.parse(settings);
			} catch (e) {
				parsedSettings = {};
			}
		}

		const decimalPlaces = parsedSettings.DecimalPlaces?.toString() || '2';
		const roundingMethod = parsedSettings.RoundingMethod || 'Round to nearest';
		const autoUpdate = parsedSettings.AutoUpdate || false;
		const showFormula = parsedSettings.ShowFormula || false;
		const allowManualOverride = parsedSettings.AllowManualOverride || false;
		const numberFormat = parsedSettings.NumberFormat || 'number';

		// Determine if this rule has conditional logic based on OperationType
		const operationType = originalRule.OperationType;
		let useConditionalLogic = false;
		let conditionMode: 'logical' | 'composite' = 'composite';
		let logicalConditionField = '';
		let logicalConditionOperator = 'Equal To';
		let logicalConditionValue = '';
		let logicalConditionName = '';
		let tree = { type: 'composite', operator: 'AND', children: [] };

		if (operationType === 'Logical' || operationType === 'Composition') {
			useConditionalLogic = true;
			conditionMode = operationType === 'Logical' ? 'logical' : 'composite';

			// Parse existing operation data
			const operationResult = parseExistingOperationData(originalRule, questionList);
			if (operationResult) {
				if (operationType === 'Logical') {
					logicalConditionField = operationResult.logicalConditionField;
					logicalConditionOperator = operationResult.logicalConditionOperator;
					logicalConditionValue = operationResult.logicalConditionValue;
					logicalConditionName = operationResult.logicalConditionName;
				} else if (operationType === 'Composition') {
					const compositionResult = operationResult as any;
					tree = compositionResult.tree;
					logicalConditionName = compositionResult.logicalConditionName;
					logicalConditionField = compositionResult.logicalConditionField;
					logicalConditionOperator = compositionResult.logicalConditionOperator;
					logicalConditionValue = compositionResult.logicalConditionValue;
				}
			}
		}

		// Load rule outcome - this is the primary source for expressions
		const ruleOutcome = originalRule.RuleOutcome;
		let outcomeMode: 'static' | 'expression' = 'expression';
		let staticValue = '';
		let staticValueDataType = 'Text';
		let expressions = { global: '0' };

		if (ruleOutcome) {
			// Parse RuleOutcome if it's a string
			let parsedRuleOutcome = ruleOutcome;
			if (typeof ruleOutcome === 'string') {
				try {
					parsedRuleOutcome = JSON.parse(ruleOutcome);
				} catch (e) {
					// Ignore parsing errors
				}
			}

			if (parsedRuleOutcome.Type === 'StaticValue') {
				outcomeMode = 'static';
				staticValue = parsedRuleOutcome.StaticValue || '';
				staticValueDataType = parsedRuleOutcome.DataType || 'Text';
			} else if (parsedRuleOutcome.Type === 'FunctionExpression') {
				outcomeMode = 'expression';
				// Use the expression from RuleOutcome, not from Operation
				expressions = { global: parsedRuleOutcome.FunctionExpression || '' };
			}
		}

		return {
			ruleName,
			ruleDescription,
			decimalPlaces,
			roundingMethod,
			autoUpdate,
			showFormula,
			allowManualOverride,
			numberFormat,
			useConditionalLogic,
			conditionMode,
			logicalConditionField,
			logicalConditionOperator,
			logicalConditionValue,
			logicalConditionName,
			tree,
			outcomeMode,
			staticValue,
			staticValueDataType,
			expressions
		};
	} catch (error) {
		return null;
	}
}

// Reset form for create mode
// Input: None
// Output: All form fields reset to default values
export function resetForCreate() {
	const resetState = getResetForCreateState();
	return resetState;
}

// Reset form state for editing
// Input: None  
// Output: All form fields reset to default values for editing mode
export function resetFormState() {
	const resetState = getResetFormState();
	return resetState;
}

// Recursively create operations from tree structure (following validation logic pattern)
// Input: Tree node object
// Output: Operation ID string
export async function createOperationsFromTree(node: any, ruleName: string, ruleDescription: string, questionList: QuestionSection[]): Promise<string> {
	if (node.type === 'logical') {
		// Create logical operation following validation logic pattern
		const condition = node.condition;

		// Only create operation if condition fields are provided and valid
		if (!condition.field || !condition.field.trim() || !condition.operator || !condition.operator.trim()) {
			throw new Error('Condition fields are required for logical operations');
		}

		// Find selected field
		const selectedField = getAllFields(questionList).find(
			(field) =>
				field.id === condition.field ||
				field.Title === condition.field ||
				field.DisplayCode === condition.field
		);
		if (!selectedField) {
			throw new Error('Selected field not found');
		}

		const operatorType = toBackendOperator(condition.operator);
		let operands: any[] = [];

		if (condition.operator === 'Is Empty' || condition.operator === 'Is Not Empty') {
			operands = [
				{
					Type: 'FieldReference',
					DataType: selectedField?.ResponseType || 'Text',
					FieldId: selectedField?.id || '',
					FieldCode: selectedField?.DisplayCode || ''
				}
			];
		} else {
			operands = [
				{
					Type: 'FieldReference',
					DataType: selectedField?.ResponseType || 'Text',
					FieldId: selectedField?.id || '',
					FieldCode: selectedField?.DisplayCode || ''
				},
				{
					Type: 'Constant',
					DataType: 'Text',
					Value: condition.value || ''
				}
			];
		}

		const logicalOperation = {
			Name: condition.name && condition.name.trim().length > 0
				? condition.name
				: `${ruleName} - Logical condition`,
			Description: `${ruleDescription} - Logical calculation condition`,
			Type: 'Logical',
			Operator: operatorType,
			Operands: JSON.stringify(operands)
		};

		const logicalResponse = await fetch('/api/server/operations/logical-operation', {
			method: 'POST',
			body: JSON.stringify(logicalOperation),
			headers: { 'content-type': 'application/json' }
		});

		if (!logicalResponse.ok) {
			const errorData = await logicalResponse.json();
			throw new Error(errorData.Message || 'Failed to create logical operation');
		}

		const logicalData = await logicalResponse.json();
		return logicalData.Data.id as string;

	} else if (node.type === 'composite') {
		// Create composite operation following validation logic pattern
		const childIds: string[] = [];

		// Recursively create operations for all children
		for (const child of node.children || []) {
			const childId = await createOperationsFromTree(child, ruleName, ruleDescription, questionList);
			childIds.push(childId);
		}

		const compositeOperation = {
			Name: `${ruleName} - Composite calculation`,
			Description: `${ruleDescription} - Composite logical calculation`,
			Type: 'Composition',
			Operator: node.operator === 'AND' ? 'And' : 'Or',
			Children: JSON.stringify(childIds)
		};

		const compositeResponse = await fetch('/api/server/operations/composition-operation', {
			method: 'POST',
			body: JSON.stringify(compositeOperation),
			headers: { 'content-type': 'application/json' }
		});

		if (!compositeResponse.ok) {
			const errorData = await compositeResponse.json();
			throw new Error(errorData.Message || 'Failed to create composite operation');
		}

		const compositeData = await compositeResponse.json();
		return compositeData.Data.id as string;
	}

	throw new Error(`Unknown node type: ${node.type}`);
}


