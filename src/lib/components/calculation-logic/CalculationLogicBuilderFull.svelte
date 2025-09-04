<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';
	import TreeNodeClean from './TreeNodeClean.svelte';
	import ExpressionBuilder from './ExpressionBuilder.svelte';
	import {
		createFunctionExpressionOperation,
		updateFunctionExpressionOperation,
		createCalculationRule,
		updateCalculationRule,
		ensureCalculationLogic,
		linkLogicToField,
		toBackendOperator
	} from './service.js';

	// Props
	let {
		isOpen = $bindable(false),
		onSave,
		onCancel,
		editingRule = null,
		questionList,
		currentField
	} = $props();

	// Editing state (simplified - all fields are editable)
	let originalRuleData = $state<any>(null);
	let originalOperationsData = $state<any>(null);

	// Rule data
	let useConditionalLogic = $state(false);
	let conditionMode = $state<'logical' | 'composite'>('composite');
	let outcomeMode = $state<'static' | 'expression'>('expression');
	let staticValue = $state('');
	let staticValueDataType = $state('Text');
	let logicalConditionName = $state('');
	let logicalConditionField = $state('');
	let logicalConditionOperator = $state('');
	let logicalConditionValue = $state('');
	let ruleName = $state('');
	let ruleDescription = $state('');

	// Tree state management
	let tree = $state<any>({
		type: 'composite',
		operator: 'AND',
		children: []
	});
	let collapsed = $state({} as Record<string, boolean>);
	let expressions = $state({} as Record<string, string>);
	let errors = $state({} as Record<string, any>);
	let decimalPlaces = $state('');
	let roundingMethod = $state('');
	let autoUpdate = $state(false);
	let showFormula = $state(false);
	let allowManualOverride = $state(false);
	let numberFormat = $state('');

	const roundingMethods = ['Round to nearest', 'Round up', 'Round down', 'Truncate'];
	const numberFormats = ['number', 'currency', 'percentage', 'scientific'];
	const dataTypes = ['Text', 'Integer', 'Float', 'Boolean', 'Date', 'DateTime'];

	// Logical operators for conditions
	const operators = [
		'Equal To',
		'Not Equal To',
		'Greater Than',
		'Less Than',
		'Greater Than or Equal',
		'Less Than or Equal',
		'Contains',
		'Does Not Contain',
		'Starts With',
		'Ends With',
		'Is Empty',
		'Is Not Empty'
	];

	// Helper function to get all available fields from questionList (flattened)
	function getAllFields() {
		const allFields = [];
		for (const section of questionList || []) {
			for (const field of section.FormFields || []) {
				allFields.push(field);
			}
		}
		return allFields;
	}

	// Helper function to get field display name
	function getFieldDisplay(fieldId: string) {
		const field = getAllFields().find((f) => f.id === fieldId);
		return field ? field.Title || field.DisplayCode : fieldId;
	}

	// Initialize editing mode when editingRule prop changes
	$effect(() => {
		if (editingRule) {
			initializeEditing();
		} else if (isOpen) {
			// Reset for create mode
			resetForCreate();
		}
	});

	// Reset form for create mode
	function resetForCreate() {
		ruleName = '';
		ruleDescription = '';
		useConditionalLogic = false;
		conditionMode = 'composite';
		outcomeMode = 'expression';
		staticValue = '';
		staticValueDataType = 'Text';
		logicalConditionName = '';
		logicalConditionField = '';
		logicalConditionOperator = '';
		logicalConditionValue = '';
		tree = { type: 'composite', operator: 'AND', children: [] };
		expressions = { global: '0' }; // Default expression to prevent empty FunctionExpression
		errors = {};
		decimalPlaces = '2';
		roundingMethod = 'Round to nearest';
		autoUpdate = false;
		showFormula = false;
		allowManualOverride = false;
		numberFormat = 'number';
		collapsed = {};
	}

	// Initialize editing mode
	async function initializeEditing() {
		if (!editingRule) return;

		console.log('🔧 Initializing editing mode with:', editingRule);

		try {
			const originalRule = editingRule.originalRule || editingRule;

			// Load basic rule data
			ruleName = originalRule.Name || '';
			ruleDescription = originalRule.Description || '';

			// Load settings - handle both object and JSON string formats
			const settings = originalRule.Settings || {};
			let parsedSettings = settings;
			if (typeof settings === 'string') {
				try {
					parsedSettings = JSON.parse(settings);
				} catch (e) {
					console.warn('Failed to parse Settings string:', e);
					parsedSettings = {};
				}
			}
			
			decimalPlaces = parsedSettings.DecimalPlaces?.toString() || '2';
			roundingMethod = parsedSettings.RoundingMethod || 'Round to nearest';
			autoUpdate = parsedSettings.AutoUpdate || false;
			showFormula = parsedSettings.ShowFormula || false;
			allowManualOverride = parsedSettings.AllowManualOverride || false;
			numberFormat = parsedSettings.NumberFormat || 'number';

			// Determine if this rule has conditional logic based on OperationType
			const operationType = originalRule.OperationType;
			console.log('🔍 Rule OperationType:', operationType);
			
			if (operationType === 'Logical' || operationType === 'Composition') {
				useConditionalLogic = true;
				conditionMode = operationType === 'Logical' ? 'logical' : 'composite';
				console.log('✅ Detected conditional logic:', { useConditionalLogic, conditionMode });
				
				// Load the conditional operations
				await loadConditionalOperations(originalRule);
			} else {
				useConditionalLogic = false;
				console.log('✅ No conditional logic detected');
			}

			// Load rule outcome - this is the primary source for expressions
			const ruleOutcome = originalRule.RuleOutcome;
			if (ruleOutcome) {
				// Parse RuleOutcome if it's a string
				let parsedRuleOutcome = ruleOutcome;
				if (typeof ruleOutcome === 'string') {
					try {
						parsedRuleOutcome = JSON.parse(ruleOutcome);
					} catch (e) {
						console.warn('Failed to parse RuleOutcome string:', e);
					}
				}
				
				if (parsedRuleOutcome.Type === 'StaticValue') {
					outcomeMode = 'static';
					staticValue = parsedRuleOutcome.StaticValue || '';
					staticValueDataType = parsedRuleOutcome.DataType || 'Text';
				} else if (parsedRuleOutcome.Type === 'FunctionExpression') {
					outcomeMode = 'expression';
					// Use the expression from RuleOutcome, not from Operation
					expressions['global'] = parsedRuleOutcome.FunctionExpression || '';
					console.log('✅ Loaded expression from RuleOutcome:', parsedRuleOutcome.FunctionExpression);
				}
			}

			console.log('✅ Editing mode initialized successfully');
		} catch (error) {
			console.error('❌ Error initializing editing mode:', error);
			toastMessage({
				Message: 'Error loading rule data for editing',
				type: 'error'
			});
		}
	}

	// Load conditional operations if they exist
	async function loadConditionalOperations(originalRule: any) {
		try {
			console.log('🔍 Loading conditional operations for rule:', originalRule);

			// Use OperationId to load the main operation
			const operationId = originalRule.OperationId || originalRule.BaseOperationId;
			if (!operationId) {
				console.log('⚠️ No operation ID found in rule');
				return;
			}

			console.log('🔍 Loading operation with ID:', operationId);

			// Try to fetch the operation based on the operation type
			const operationType = originalRule.OperationType;
			
			if (operationType === 'Logical') {
				const response = await fetch(`/api/server/operations/logical-operation/${operationId}`);
				if (response.ok) {
					const operationData = await response.json();
					const operation = operationData.Data;
					console.log('📥 Loaded logical operation:', operation);
					await parseAndPopulateOperation(operation);
				} else {
					console.error('❌ Failed to load logical operation:', response.status);
				}
			} else if (operationType === 'Composition') {
				const response = await fetch(`/api/server/operations/composition-operation/${operationId}`);
				if (response.ok) {
					const operationData = await response.json();
					const operation = operationData.Data;
					console.log('📥 Loaded composition operation:', operation);
					await parseAndPopulateCompositionOperation(operation);
				} else {
					console.error('❌ Failed to load composition operation:', response.status);
				}
			}
		} catch (error) {
			console.error('❌ Error loading conditional operations:', error);
		}
	}

	// Parse and populate a single logical operation
	async function parseAndPopulateOperation(operation: any) {
		useConditionalLogic = true;
		conditionMode = 'logical';

		// Parse operands to extract field, operator, value
		if (operation.Operands) {
			const operands = JSON.parse(operation.Operands);

			// Extract field information
			if (operands[0] && operands[0].Type === 'FieldReference') {
				logicalConditionField = operands[0].FieldId || '';
			}

			// Map operator back to display name
			logicalConditionOperator = mapBackendOperatorToDisplay(operation.Operator);

			// Extract value
			if (operands[1] && operands[1].Type === 'Constant') {
				logicalConditionValue = operands[1].Value || '';
			}

			// Set condition name
			logicalConditionName = operation.Name || '';
		}
	}

	// Parse and populate a composition operation (tree structure)
	async function parseAndPopulateCompositionOperation(operation: any) {
		useConditionalLogic = true;
		conditionMode = 'composite';

		// Parse the composition operation and build the tree
		console.log('🌳 Building tree from composition operation:', operation);

		// Parse children from the operation
		let childrenIds: string[] = [];
		if (operation.Children) {
			if (typeof operation.Children === 'string') {
				try {
					childrenIds = JSON.parse(operation.Children);
				} catch (e) {
					console.warn('Failed to parse Children string:', e);
					childrenIds = [];
				}
			} else if (Array.isArray(operation.Children)) {
				childrenIds = operation.Children;
			}
		}

		console.log('🔍 Children IDs to load:', childrenIds);

		// Recursively load child operations and build the tree
		const children = [];
		for (const childId of childrenIds) {
			try {
				// Try to load as logical operation first
				const logicalResponse = await fetch(`/api/server/operations/logical-operation/${childId}`);
				if (logicalResponse.ok) {
					const logicalData = await logicalResponse.json();
					const logicalOp = logicalData.Data;
					
					// Parse logical operation into tree node
					const logicalNode = await parseLogicalOperationToTreeNode(logicalOp);
					children.push(logicalNode);
				} else {
					// Try to load as composition operation
					const compResponse = await fetch(`/api/server/operations/composition-operation/${childId}`);
					if (compResponse.ok) {
						const compData = await compResponse.json();
						const compOp = compData.Data;
						
						// Recursively parse composition operation
						const compNode = await parseCompositionOperationToTreeNode(compOp);
						children.push(compNode);
					}
				}
			} catch (error) {
				console.error(`❌ Error loading child operation ${childId}:`, error);
			}
		}

		// Build the tree structure
		tree = {
			type: 'composite',
			operator: operation.Operator === 'And' ? 'AND' : 'OR',
			children: children
		};

		console.log('✅ Built tree structure:', tree);
	}

	// Helper function to parse logical operation into tree node
	async function parseLogicalOperationToTreeNode(operation: any) {
		let field = '';
		let value = '';
		let operator = 'Equal To';

		// Parse operands to extract field, operator, value
		if (operation.Operands) {
			const operands = JSON.parse(operation.Operands);

			// Extract field information
			if (operands[0] && operands[0].Type === 'FieldReference') {
				field = operands[0].FieldId || '';
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

	// Helper function to parse composition operation into tree node
	async function parseCompositionOperationToTreeNode(operation: any) {
		// Parse children from the operation
		let childrenIds: string[] = [];
		if (operation.Children) {
			if (typeof operation.Children === 'string') {
				try {
					childrenIds = JSON.parse(operation.Children);
				} catch (e) {
					childrenIds = [];
				}
			} else if (Array.isArray(operation.Children)) {
				childrenIds = operation.Children;
			}
		}

		// Recursively load child operations
		const children = [];
		for (const childId of childrenIds) {
			try {
				// Try to load as logical operation first
				const logicalResponse = await fetch(`/api/server/operations/logical-operation/${childId}`);
				if (logicalResponse.ok) {
					const logicalData = await logicalResponse.json();
					const logicalOp = logicalData.Data;
					const logicalNode = await parseLogicalOperationToTreeNode(logicalOp);
					children.push(logicalNode);
				} else {
					// Try to load as composition operation
					const compResponse = await fetch(`/api/server/operations/composition-operation/${childId}`);
					if (compResponse.ok) {
						const compData = await compResponse.json();
						const compOp = compData.Data;
						const compNode = await parseCompositionOperationToTreeNode(compOp);
						children.push(compNode);
					}
				}
			} catch (error) {
				console.error(`❌ Error loading child operation ${childId}:`, error);
			}
		}

		return {
			type: 'composite',
			operator: operation.Operator === 'And' ? 'AND' : 'OR',
			children: children
		};
	}

	// Helper function to map backend operators back to display names
	function mapBackendOperatorToDisplay(backendOp: string): string {
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

	// Tree manipulation functions
	function addLogical(path: number[]) {
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
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function addGroup(path: number[], operator: 'AND' | 'OR' = 'AND') {
		const newGroup = {
			type: 'composite',
			operator,
			children: []
		};

		const target = getNodeAtPath(tree, path);
		if (target?.type === 'composite') {
			target.children.push(newGroup);
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function removeNode(path: number[]) {
		if (path.length === 0) return; // Can't remove root

		const parentPath = path.slice(0, -1);
		const index = path[path.length - 1];
		const parent = getNodeAtPath(tree, parentPath);

		if (parent?.type === 'composite' && parent.children) {
			parent.children.splice(index, 1);
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function getNodeAtPath(node: any, path: number[]): any {
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

	function updateGroupOperator(path: number[], operator: 'AND' | 'OR') {
		const node = getNodeAtPath(tree, path);
		if (node?.type === 'composite') {
			node.operator = operator;
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function updateLeafField(path: number[], field: string) {
		const node = getNodeAtPath(tree, path);
		if (node?.type === 'logical') {
			node.condition.field = field;
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function updateLeafOperator(path: number[], operator: string) {
		const node = getNodeAtPath(tree, path);
		if (node?.type === 'logical') {
			node.condition.operator = operator;
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function updateLeafValue(path: number[], value: string) {
		const node = getNodeAtPath(tree, path);
		if (node?.type === 'logical') {
			node.condition.value = value;
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function updateLeafName(path: number[], name: string) {
		const node = getNodeAtPath(tree, path);
		if (node?.type === 'logical') {
			node.condition.name = name;
			tree = { ...tree }; // Trigger reactivity
		}
	}

	function updateExpression(key: string, value: string) {
		expressions[key] = value;
	}

	function toggleCollapse(path: number[]) {
		const key = path.join('-');
		collapsed[key] = !collapsed[key];
	}

	// Initialize fields when editing
	$effect(() => {
		const original = editingRule?.originalRule;
		if (!original) return;
		ruleName = original.Name || '';
		ruleDescription = original.Description || '';
		let s: any = original.Settings ?? original.settings ?? {};
		if (typeof s === 'string') {
			try {
				s = JSON.parse(s);
			} catch {
				s = {};
			}
		}
		if (s && typeof s === 'object') {
			if (s.DecimalPlaces !== undefined && s.DecimalPlaces !== null)
				decimalPlaces = `${s.DecimalPlaces}`;
			if (s.RoundingMethod !== undefined && s.RoundingMethod !== null)
				roundingMethod = `${s.RoundingMethod}`;
			if (s.AutoUpdate !== undefined) autoUpdate = !!s.AutoUpdate;
			if (s.ShowFormula !== undefined) showFormula = !!s.ShowFormula;
			if (s.AllowManualOverride !== undefined) allowManualOverride = !!s.AllowManualOverride;
			if (s.NumberFormat !== undefined && s.NumberFormat !== null)
				numberFormat = `${s.NumberFormat}`;
		}
	});

	function handleCancel(event) {
		event?.preventDefault();
		event?.stopPropagation();
		onCancel?.();
	}

	// Handle updating existing calculation rule
	async function handleUpdateRule(event) {
		event?.preventDefault();
		event?.stopPropagation();
		
		// Validate required fields
		if (!ruleName.trim()) {
			toastMessage({
				Message: 'Rule name is required',
				HttpCode: 400
			});
			return;
		}

		if (!editingRule?.id) {
			toastMessage({
				Message: 'No rule ID found for updating',
				HttpCode: 400
			});
			return;
		}
		
		try {
			toastMessage({
				Message: 'Updating calculation rule...',
				type: 'info'
			});

			console.log('🔄 Starting calculation rule update workflow...');
			console.log('Editing rule:', editingRule);

			let conditionsOperationId: string | null = null;
			let outcomeOperationId: string | null = null;

			// Step 1: Update operations if they have changed
			if (useConditionalLogic) {
				console.log('📝 Step 1: Updating conditional operations...');

				if (conditionMode === 'logical') {
					// Update or create logical operation
					const condition = {
						field: logicalConditionField,
						operator: logicalConditionOperator,
						value: logicalConditionValue,
						name: logicalConditionName
					};

					// Check if we need to update existing operation or create new one
					if (editingRule.conditionsOperationId) {
						// Update existing logical operation following validation logic pattern
						const selectedField = getAllFields().find(
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

						const payload = {
							Name: condition.name && condition.name.trim().length > 0
								? condition.name
								: `${ruleName} - Logical condition`,
							Description: `${ruleDescription} - Logical calculation condition`,
							Operator: operatorType,
							Operands: JSON.stringify(operands)
						};

						const res = await fetch(`/api/server/operations/logical-operation/${editingRule.conditionsOperationId}`, {
							method: 'PUT',
							headers: { 'content-type': 'application/json' },
							body: JSON.stringify(payload)
						});

						if (!res.ok) {
							const d = await res.json();
							throw new Error(d?.Message || 'Failed to update logical operation');
						}
						
						conditionsOperationId = editingRule.conditionsOperationId;
						console.log('✅ Updated logical operation:', conditionsOperationId);
					} else {
						// Create new logical operation following validation logic pattern
						const selectedField = getAllFields().find(
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
						conditionsOperationId = logicalData.Data.id as string;
						console.log('✅ Created new logical operation:', conditionsOperationId);
					}
				} else if (conditionMode === 'composite') {
					// Update or create composite operation
					// For now, recreate the composite operations from tree
					conditionsOperationId = await createOperationsFromTree(tree);
					console.log('✅ Updated composite operation:', conditionsOperationId);
				}
			}

			// Step 2: Update function expression operation
			console.log('📊 Step 2: Updating function expression operation...');

			if (outcomeMode === 'expression') {
				// Check if we need to update existing operation or create new one
				if (editingRule.outcomeOperationId) {
					// Update existing function expression operation
					await updateFunctionExpressionOperation(
						editingRule.outcomeOperationId,
						expressions['global'] || '',
						ruleName,
						questionList
					);
					outcomeOperationId = editingRule.outcomeOperationId;
					console.log('✅ Updated function expression operation:', outcomeOperationId);
				} else {
					// Create new function expression operation
					outcomeOperationId = await createFunctionExpressionOperation(
						expressions['global'] || '',
						ruleName,
						questionList
					);
					console.log('✅ Created new function expression operation:', outcomeOperationId);
				}
			}

			// Step 3: Update the calculation rule
			console.log('📋 Step 3: Updating calculation rule...');
		const settings = {
				DecimalPlaces: parseInt(decimalPlaces) || 2,
			RoundingMethod: roundingMethod,
			AutoUpdate: autoUpdate,
			ShowFormula: showFormula,
			AllowManualOverride: allowManualOverride,
			NumberFormat: numberFormat
		};

			// Prepare RuleOutcome based on outcomeMode
			let ruleOutcome = null;
			if (outcomeMode === 'static') {
				ruleOutcome = {
					Type: 'StaticValue',
					StaticValue: staticValue,
					DataType: staticValueDataType
				};
			} else if (outcomeMode === 'expression' && outcomeOperationId) {
				ruleOutcome = {
					Type: 'FunctionExpression',
					FunctionExpression: expressions['global'] || '',
					FunctionExpressionId: outcomeOperationId
				};
			}

			// Determine the operation type based on user's choice
			const operationType = useConditionalLogic ? 
				(conditionMode === 'logical' ? 'Logical' : 'Composition') : 
				'FunctionExpression';

			// Update the calculation rule
			await updateCalculationRule({
				ruleId: editingRule.id,
				conditionOperationId: conditionsOperationId || '',
				operationType,
				ruleName,
				ruleDescription,
				settings,
				ruleOutcome
			});

			console.log('✅ Updated calculation rule');

			console.log('🎉 Rule update completed successfully!');

			// Success!
			toastMessage({
				Message: 'Calculation rule updated successfully!',
				type: 'success'
			});

			// Call the onSave callback
			if (onSave) {
				const resultData = {
					ruleId: editingRule.id,
					conditionsOperationId,
					outcomeOperationId,
			ruleName,
			ruleDescription,
			settings,
					ruleOutcome,
					isUpdate: true
				};
				onSave(resultData);
			}

			// Close the modal
			onCancel?.();
		} catch (e) {
			console.error('❌ Error updating calculation rule:', e);
			toastMessage({
				Message: (e as Error)?.message || 'Failed to update calculation rule',
				HttpCode: 500
			});
		}
	}


	async function handleSave(event) {
		event?.preventDefault();
		event?.stopPropagation();

		// Check if this is an edit operation
		if (editingRule) {
			return await handleUpdateRule(event);
		}

		// Validate required fields
		if (!ruleName.trim()) {
			toastMessage({
				Message: 'Rule name is required',
				HttpCode: 400
			});
			return;
		}

		if (!currentField?.id) {
			toastMessage({
				Message: 'No field selected for calculation logic',
				HttpCode: 400
			});
			return;
		}

		try {
			toastMessage({
				Message: 'Creating calculation logic...',
				type: 'info'
			});

			console.log('🚀 Starting calculation logic creation workflow...');
			console.log('Current field:', currentField);
			console.log('Use conditional logic:', useConditionalLogic);
			console.log('Condition mode:', conditionMode);

			let conditionsOperationId: string | null = null;

			// Step 1: Create operations based on the logic type
			if (useConditionalLogic) {
				console.log('📝 Step 1: Creating conditional operations...');

				if (conditionMode === 'logical') {
					console.log(
						'Creating logical operation for:',
						logicalConditionField,
						logicalConditionOperator,
						logicalConditionValue
					);

					// Create logical operation for single condition following validation logic pattern
					const selectedField = getAllFields().find(
						(field) =>
							field.id === logicalConditionField ||
							field.Title === logicalConditionField ||
							field.DisplayCode === logicalConditionField
					);
					if (!selectedField) {
						throw new Error('Selected field not found');
					}
					
					const operatorType = toBackendOperator(logicalConditionOperator);
					let operands: any[] = [];
					
					if (logicalConditionOperator === 'Is Empty' || logicalConditionOperator === 'Is Not Empty') {
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
								Value: logicalConditionValue || ''
							}
						];
					}

					const logicalOperation = {
						Name: logicalConditionName && logicalConditionName.trim().length > 0 
							? logicalConditionName 
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
					conditionsOperationId = logicalData.Data.id as string;
					
					console.log('✅ Created logical operation with ID:', conditionsOperationId);
				} else if (conditionMode === 'composite') {
					console.log('Creating composite operation from tree:', tree);

					// Create composite operation for tree structure
					// This will create multiple operations for the complete tree
					conditionsOperationId = await createOperationsFromTree(tree);
					
					console.log('✅ Created composite operation tree with ID:', conditionsOperationId);
				}
			} else {
				console.log('⏭️ Skipping conditional operations (useConditionalLogic is false)');
			}
			
			// Debug: Show what operation ID we have
			console.log('🔍 Final conditionsOperationId:', conditionsOperationId);
			
			// Validate that we have a condition operation if conditional logic is enabled
			if (useConditionalLogic && !conditionsOperationId) {
				throw new Error('Failed to create condition operation. Please check your condition settings.');
			}

			// Step 2: Create function expression operation (but don't use it in the rule)
			console.log('📊 Step 2: Creating function expression operation...');
			console.log('Expression:', expressions['global']);

			if (outcomeMode === 'expression') {
				// Create function expression operation (but don't use it in the rule)
				const expressionResult = await createFunctionExpressionOperation(
					expressions['global'] || '',
					ruleName,
					questionList
				);
				console.log('✅ Created function expression operation:', expressionResult);
				
				// Note: We don't store this in the rule, just create it for reference
			} else {
				console.log('⏭️ Skipping function expression (outcomeMode is static)');
			}

			// Step 3: Create the calculation rule with ONLY logical/composite operations
			console.log('📋 Step 3: Creating calculation rule...');
			
			// First create a calculation logic if it doesn't exist
			let logicId = currentField?.CalculateLogic?.id || '';
			if (!logicId) {
				logicId = await ensureCalculationLogic(currentField);
			}
			
			// Debug the outcome values
			console.log('🔍 Debug outcome values:', {
				outcomeMode,
				staticValue,
				expressionsGlobal: expressions['global'],
				hasExpressions: !!expressions['global']
			});
			
			// Validate that we have content for the outcome
			if (outcomeMode === 'static' && !staticValue.trim()) {
				throw new Error('Static value is required when outcome mode is static');
			}
			
			if (outcomeMode === 'expression' && (!expressions['global'] || !expressions['global'].trim())) {
				throw new Error('Function expression is required when outcome mode is expression');
			}
			
			const ruleOutcome = outcomeMode === 'static' ? {
				Type: 'StaticValue',
				StaticValue: staticValue,
				DataType: staticValueDataType
			} : {
				Type: 'FunctionExpression',
				FunctionExpression: expressions['global'] || '',
				DataType: 'Float'
			};
			
			console.log('🔍 Created ruleOutcome:', ruleOutcome);
			
			// Determine the operation type based on user's choice
			const operationType = useConditionalLogic ? 
				(conditionMode === 'logical' ? 'Logical' : 'Composition') : 
				'FunctionExpression';

			const ruleData = {
				logicId,
				conditionOperationId: conditionsOperationId || '', // Use the logical/composite operation ID as the main operation
				operationType, // Pass the correct operation type
				ruleName,
				ruleDescription,
				settings: {
					DecimalPlaces: parseInt(decimalPlaces) || 2,
					RoundingMethod: roundingMethod,
					AutoUpdate: autoUpdate,
					ShowFormula: showFormula,
					AllowManualOverride: allowManualOverride,
					NumberFormat: numberFormat
				},
				ruleOutcome
			};

			console.log('🔍 Rule data being sent to API:', ruleData);
			console.log('🔍 Using condition operation ID as main operation:', conditionsOperationId);
			console.log('🔍 Operation type:', operationType);
			const ruleResult = await createCalculationRule(ruleData);
			console.log('✅ Created calculation rule:', ruleResult);

			// Step 4: Update the form field with the logic ID
			await linkLogicToField(currentField, logicId);
			console.log('✅ Updated field with logic ID');

			// Success!
			toastMessage({
				Message: 'Calculation logic created and saved successfully!',
				type: 'success'
			});

			// Call the onSave callback with the result
			if (onSave) {
				onSave(ruleResult);
			}

			// Close the modal
			onCancel?.();

		} catch (e) {
			console.error('Error saving calculation logic:', e);
			toastMessage({
				Message: (e as Error)?.message || 'Failed to save calculation rule',
				HttpCode: 500
			});
		}
	}



	// Helper function to recursively create operations from tree structure (following validation logic pattern)
	async function createOperationsFromTree(node: any): Promise<string> {
		if (node.type === 'logical') {
			// Create logical operation following validation logic pattern
			const condition = node.condition;
			
			// Find selected field
			const selectedField = getAllFields().find(
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
				const childId = await createOperationsFromTree(child);
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
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
		<!-- Modal -->
		<div class="max-h-[90vh] w-[95%] max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl">
			<!-- Modal Header -->
			<div class="flex items-center justify-between rounded-t-lg bg-slate-700 p-5 text-white">
				<div>
				<h2 class="text-lg font-semibold">Field Calculation Logic Builder</h2>
				</div>
				<button
					type="button"
					class="rounded p-1 text-2xl text-white hover:bg-slate-600"
					onclick={handleCancel}
				>
					×
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-8">
				<!-- 1. Rule Name -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Name</Label>
					<Input
						bind:value={ruleName}
						placeholder="Enter rule name"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
					/>
					{#if errors.ruleName}
						<div class="mt-1 text-xs text-red-600">{errors.ruleName}</div>
					{/if}
					<div class="mt-1 text-xs text-gray-500">(Maximum 100 characters)</div>
				</div>

				<!-- 2. Rule Description -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Rule Description</Label>
					<Input
						bind:value={ruleDescription}
						placeholder="Enter rule description (optional)"
						class="w-full rounded-md border-2 border-gray-200 p-3 text-sm focus:border-blue-500"
					/>
					<div class="mt-1 text-xs text-gray-500">(Optional: Describe what this rule does)</div>
				</div>

				<!-- 3. Conditional Logic Checkbox -->
				<div class="mb-4">
					<div class="flex items-center justify-between">
						<label class="inline-flex items-center gap-2 text-base font-medium text-gray-900">
							<input
								type="checkbox"
								bind:checked={useConditionalLogic}
								class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							Conditional
					</label>
					</div>
				</div>

				<!-- 4. Conditions Section -->
				{#if useConditionalLogic}
					<div class="mb-6 rounded-lg border border-gray-300 p-6">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-base font-medium text-blue-600">condition</h3>
						</div>

						<!-- Mode Selection: Logical vs Composite -->
						<div class="mb-6 flex items-center gap-8">
							<label class="flex items-center gap-2">
								<input
									type="radio"
									name="conditionMode"
									value="logical"
									bind:group={conditionMode}
									class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-base">Logical</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="radio"
									name="conditionMode"
									value="composite"
									bind:group={conditionMode}
									class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								<span class="text-base">Composite</span>
							</label>
						</div>

						<!-- Dynamic Content Based on Selection -->
						{#if conditionMode === 'logical'}
							<!-- Simple Logical Form -->
							<div class="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label class="text-sm font-medium text-gray-700">Name of Condition</Label>
										<Input
											type="text"
											bind:value={logicalConditionName}
											placeholder="Enter condition name"
											class="w-full"
										/>
									</div>
									<div class="space-y-2">
										<Label class="text-sm font-medium text-gray-700">Field</Label>
										<Select.Root
											type="single"
											bind:value={logicalConditionField}
										>
											<Select.Trigger class="w-full">
												{logicalConditionField
													? getFieldDisplay(logicalConditionField)
													: 'Select field'}
											</Select.Trigger>
											<Select.Content>
												{#each getAllFields() as field}
													<Select.Item value={field.id} label={field.Title || field.DisplayCode} />
												{/each}
											</Select.Content>
										</Select.Root>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-2">
										<Label class="text-sm font-medium text-gray-700">Operator</Label>
										<Select.Root
											type="single"
											bind:value={logicalConditionOperator}
										>
											<Select.Trigger class="w-full">
												{logicalConditionOperator || 'Select operator'}
											</Select.Trigger>
											<Select.Content>
												{#each operators as operator}
													<Select.Item value={operator} label={operator} />
												{/each}
											</Select.Content>
										</Select.Root>
									</div>
									<div class="space-y-2">
										<Label class="text-sm font-medium text-gray-700">Value</Label>
										<Input
											type="text"
											bind:value={logicalConditionValue}
											placeholder="Enter value"
											class="w-full"
										/>
									</div>
								</div>
							</div>
						{:else}
							<!-- Composite Tree Structure -->
							<TreeNodeClean
								node={tree}
								path={[]}
								fields={getAllFields()}
								{operators}
								onAddLogical={addLogical}
								onAddGroup={addGroup}
								onRemove={removeNode}
								onChangeGroupOperator={updateGroupOperator}
								onChangeLeafField={updateLeafField}
								onChangeLeafOperator={updateLeafOperator}
								onChangeLeafValue={updateLeafValue}
								onChangeLeafName={updateLeafName}
								onChangeExpression={updateExpression}
								errorsByPath={errors}
								collapsedByPath={collapsed}
								onToggleCollapse={toggleCollapse}
								expressionsByPath={expressions}
								readonly={false}
								showOnlyConditions={true}
							/>
						{/if}
					</div>
				{/if}

				<!-- 5. Outcome Section -->
				<div class="mb-6 rounded-lg border border-gray-300 p-6">
					<h3 class="mb-4 text-base font-medium text-gray-900">Outcome</h3>

					<!-- Outcome Type Selection -->
					<div class="mb-6 flex items-center gap-8">
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="outcomeMode"
								value="static"
								bind:group={outcomeMode}
								class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-base">Static Value</span>
						</label>
						<label class="flex items-center gap-2">
							<input
								type="radio"
								name="outcomeMode"
								value="expression"
								bind:group={outcomeMode}
								class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<span class="text-base">Calculation Expression</span>
						</label>
					</div>

					<!-- Outcome Content -->
					{#if outcomeMode === 'static'}
						<div class="space-y-4">
							<div class="space-y-2">
								<Label class="text-sm font-medium text-gray-700">Static Value</Label>
								<Input
									type="text"
									bind:value={staticValue}
									placeholder="Enter static value"
									class="w-full"
								/>
							</div>
							<div class="space-y-2">
								<Label class="text-sm font-medium text-gray-700">Data Type</Label>
								<Select.Root
									type="single"
									bind:value={staticValueDataType}
								>
									<Select.Trigger class="w-full">
										{staticValueDataType}
									</Select.Trigger>
									<Select.Content>
										{#each dataTypes as dataType}
											<Select.Item value={dataType}>{dataType}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<div class="text-xs text-gray-500">
									Select the data type for the static value (Text, Integer, Float, Boolean, Date, DateTime)
								</div>
							</div>
						</div>
					{:else}
						<div class="space-y-3">
							<ExpressionBuilder
								expression={expressions['global'] || ''}
								onExpressionChange={(value) => updateExpression('global', value)}
								fields={getAllFields()}
								placeholder="Enter the calculation expression..."
								size="default"
								showValidation={true}
								readonly={false}
							/>
						</div>
					{/if}
				</div>

				<!-- Calculation Settings -->
				<div class="mb-6 rounded-lg border-2 border-gray-200 bg-white p-5">
					<div class="mb-4 flex items-center gap-2">
						<Icon icon="lucide:settings" class="h-5 w-5" />
						<h3 class="font-semibold text-slate-700">Calculation Settings</h3>
					</div>
					<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label class="mb-2 block font-semibold text-slate-700">Decimal Places</Label>
							<Select.Root
								type="single"
								name="DecimalPlaces"
								bind:value={decimalPlaces}
							>
								<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
									{decimalPlaces}
								</Select.Trigger>
								<Select.Content>
									{#each ['0', '1', '2', '3', '4'] as places}
										<Select.Item value={places}>{places}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div>
							<Label class="mb-2 block font-semibold text-slate-700">Rounding Method</Label>
							<Select.Root
								type="single"
								name="RoundingMethod"
								bind:value={roundingMethod}
							>
								<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
									{roundingMethod}
								</Select.Trigger>
								<Select.Content>
									{#each roundingMethods as method}
										<Select.Item value={method}>{method}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="mb-4 space-y-3">
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="autoUpdate"
								bind:checked={autoUpdate}
								class="h-4 w-4"
							/>
							<Label for="autoUpdate">Auto-update when dependent fields change</Label>
						</div>
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="showFormula"
								bind:checked={showFormula}
								class="h-4 w-4"
							/>
							<Label for="showFormula">Show formula to users</Label>
						</div>
						<div class="flex items-center gap-3">
							<input
								type="checkbox"
								id="allowManualOverride"
								bind:checked={allowManualOverride}
								class="h-4 w-4"
							/>
							<Label for="allowManualOverride">Allow manual override</Label>
						</div>
					</div>

					<div>
						<Label class="mb-2 block font-semibold text-slate-700">Number Format</Label>
						<div class="flex gap-2">
							{#each numberFormats as format}
								<Button
									type="button"
									variant={numberFormat === format ? 'default' : 'outline'}
									size="sm"
									onclick={() => (numberFormat = format)}
									class="text-xs"
									disabled={false}
								>
									{format === 'number'
										? '1,234.56'
										: format === 'currency'
											? '$1,234.56'
											: format === 'percentage'
												? '12.34%'
												: '1.23e+3'}
								</Button>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Modal Footer -->
			<div class="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-8 py-5">
				<Button
					type="button"
					onclick={handleCancel}
					variant="outline"
					class="rounded-md border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
				>
					<Icon icon="lucide:x" class="mr-2 h-4 w-4" />
					Cancel
				</Button>
				<Button
					type="button"
					onclick={handleSave}
					class="rounded-md bg-slate-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
				>
					<Icon icon="lucide:save" class="mr-2 h-4 w-4" />
					Save Rule
				</Button>
			</div>
		</div>
	</div>
{/if}
