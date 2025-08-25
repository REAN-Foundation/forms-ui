<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Input } from '../ui/input/index.js';
	import { Label } from '../ui/label/index.js';
	import * as Select from '../ui/select/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';
	import LogicTreePanel from '../logic-tree/LogicTreePanel.svelte';
	import CalculationExpression from './CalculationExpression.svelte';
	import CalculationConditional from './CalculationConditional.svelte';

	// Props
	let {
		isOpen = $bindable(false),
		onSave,
		onCancel,
		editingRule = null,
		questionList,
		currentField
	} = $props();

	// Main toggle for conditional logic (legacy, replaced by mode selector)
	let useConditionalLogic = $state(false);
	// Mode selector: 'expression' or 'conditional'
	let selectedCalcMode = $state<'expression' | 'conditional'>('expression');
	let exprRef = $state<any>(null);
	let condRef = $state<any>(null);

	// State for form data (empty by default)
	let ruleName = $state('');
	let targetField = $state('');
	let expression = $state('');
	let decimalPlaces = $state('');
	let roundingMethod = $state('');
	let autoUpdate = $state(false);
	let showFormula = $state(false);
	let allowManualOverride = $state(false);
	let numberFormat = $state('');
	let testResult = $state('');
	let resultClass = $state('');
	let fallbackExpression = $state('');

	// Conditional calculations
	let conditionalCalculations = $state([]);

	// Errors
	let errors = $state({} as Record<string, string>);

	// Available fields and operators
	const fields = [
		{ name: 'Quantity', type: 'Number' },
		{ name: 'Unit Price', type: 'Currency' },
		{ name: 'Discount %', type: 'Number' },
		{ name: 'Tax Rate', type: 'Number' },
		{ name: 'Shipping Cost', type: 'Currency' },
		{ name: 'Weight', type: 'Number' },
		{ name: 'Age', type: 'Number' },
		{ name: 'Date of Birth', type: 'Date' }
	];
	const targetFields = [
		'Total Price',
		'Tax Amount',
		'Discount Amount',
		'Final Total',
		'Age in Days',
		'BMI',
		'Commission'
	];
	const operators = [
		'Is Empty',
		'Is Not Empty',
		'Greater Than',
		'Less Than',
		'Equal To',
		'Not Equal To',
		'Contains',
		'Does Not Contain',
		'Greater Than or Equal',
		'Less Than or Equal'
	];
	const roundingMethods = ['Round to nearest', 'Round up', 'Round down', 'Truncate'];
	const numberFormats = ['number', 'currency', 'percentage', 'scientific'];

	// Helper: find field by id from questionList
	function getFieldById(fieldId: string) {
		for (const section of questionList || []) {
			for (const f of section?.FormFields || []) {
				if (f?.id === fieldId) return f;
			}
		}
		return null;
	}

	// Helper: hyphen-slug for display tokens
	function toHyphenSlug(s: string) {
		return (s || '')
			.toString()
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	// Rebuild UI expression from backend operation (Expression + Variables)
	function rebuildExpressionFromOperation(op: any): string {
		if (!op) return '';
		let vars: any = op.Variables;
		if (typeof vars === 'string') {
			try {
				vars = JSON.parse(vars);
			} catch {
				vars = {};
			}
		}
		let expr: string = op.Expression || '';
		if (!vars || typeof vars !== 'object') return expr;
		// Replace each variable name in expression with UI token {variableName}
		for (const [varName] of Object.entries(vars)) {
			const token = `{${varName}}`;
			const re = new RegExp(`\b${varName}\b`, 'g');
			expr = expr.replace(re, token);
		}
		return expr;
	}

	// Initialize/reset form data based on mode
	$effect(() => {
		if (editingRule) {
			ruleName = editingRule.ruleName || editingRule.originalRule?.Name || '';
			targetField = editingRule.targetField || '';
			// Prefer reconstructing from original operation
			const op = editingRule.originalRule?.Operation;
			if (op) {
				expression = rebuildExpressionFromOperation(op);
			} else {
				expression = editingRule.expression || '';
			}
			decimalPlaces = editingRule.decimalPlaces?.toString() || '';
			numberFormat = editingRule.numberFormat || '';
			conditionalCalculations = editingRule.conditionalCalculations || [];
			useConditionalLogic = (editingRule.conditionalCalculations?.length || 0) > 0;
			const opType = (editingRule.originalRule?.OperationType || '').toLowerCase();
			selectedCalcMode = opType === 'functionexpression' ? 'expression' : 'conditional';
		} else {
			ruleName = '';
			targetField = '';
			expression = '';
			decimalPlaces = '';
			numberFormat = '';
			conditionalCalculations = [];
			useConditionalLogic = false;
			selectedCalcMode = 'expression';
		}
	});

	function insertField(fieldName: string) {
		const base = (fieldName || '').toString().trim().toLowerCase();
		const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		insertTokenAtCaret(`{${slug}}`);
	}

	function insertOperator(operator: string) {
		insertTokenAtCaret(` ${operator} `);
	}

	function insertFunction(functionName: string) {
		// Place caret inside parentheses for immediate argument entry
		insertTokenAtCaret(`${functionName}()`, functionName.length + 1);
	}

	// Textarea ref and helpers to insert at caret
	let expressionTextarea = $state<HTMLTextAreaElement | null>(null);
	function insertTokenAtCaret(token: string, caretOffsetFromStart?: number) {
		const el: any = expressionTextarea;
		if (el && typeof el.selectionStart === 'number') {
			const start = el.selectionStart;
			const end = el.selectionEnd;
			expression = `${expression.slice(0, start)}${token}${expression.slice(end)}`;
			setTimeout(() => {
				try {
					const offset =
						typeof caretOffsetFromStart === 'number' ? caretOffsetFromStart : token.length;
					el.selectionStart = el.selectionEnd = start + offset;
					el.focus();
				} catch {}
			});
		} else {
			expression += token;
		}
	}
	function normalizeFieldTokenFromQuestion(field: any): string {
		// Prefer Title, fall back to DisplayCode
		const raw = (field?.Title || field?.DisplayCode || '').toString();
		const base = raw.trim().toLowerCase();
		// Convert any non-alphanumeric sequence to a single hyphen
		const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		return `{${slug}}`;
	}
	function insertFieldFromQuestion(field: any) {
		insertTokenAtCaret(normalizeFieldTokenFromQuestion(field));
	}

	// ---------- Condition Tree state (shared with validation logic) ----------
	type FlatCondition = {
		field: string;
		operator: string;
		value?: string;
		name?: string;
		connector?: 'AND' | 'OR' | '' | null;
	};
	type LogicalNode = { type: 'logical'; id?: string; condition: FlatCondition };
	type CompositeNode = {
		type: 'composite';
		id?: string;
		operator: 'AND' | 'OR';
		children: Array<LogicalNode | CompositeNode>;
	};

	let treeRoot = $state<CompositeNode>({
		type: 'composite',
		operator: 'AND',
		children: [
			{
				type: 'logical',
				condition: { field: '', operator: 'Equal To', value: '', connector: null, name: '' }
			}
		]
	});
	let collapsedByPath = $state({} as Record<string, boolean>);
	function pathKey(path: number[]) {
		return path.join('-');
	}
	function onToggleCollapse(path: number[]) {
		const k = pathKey(path);
		collapsedByPath[k] = !collapsedByPath[k];
		collapsedByPath = { ...collapsedByPath };
	}
	function getNodeByPath(path: number[]): CompositeNode | LogicalNode {
		let node: any = treeRoot;
		for (const idx of path) node = node.children[idx];
		return node;
	}
	function onAddLogical(pathToComposite: number[]) {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		comp.children = [
			...comp.children,
			{
				type: 'logical',
				condition: { field: '', operator: 'Equal To', value: '', connector: null, name: '' }
			}
		];
		treeRoot = { ...treeRoot };
	}
	function onAddGroup(pathToComposite: number[], op: 'AND' | 'OR') {
		const comp =
			pathToComposite.length === 0 ? treeRoot : (getNodeByPath(pathToComposite) as CompositeNode);
		comp.children = [...comp.children, { type: 'composite', operator: op, children: [] }];
		treeRoot = { ...treeRoot };
	}
	function onRemove(path: number[]) {
		if (path.length === 0) return;
		const parentPath = path.slice(0, -1);
		const parent =
			parentPath.length === 0 ? treeRoot : (getNodeByPath(parentPath) as CompositeNode);
		const idx = path[path.length - 1];
		(parent as CompositeNode).children = (parent as CompositeNode).children.filter(
			(_, i) => i !== idx
		);
		treeRoot = { ...treeRoot };
	}
	function onChangeGroupOperator(path: number[], op: 'AND' | 'OR') {
		const node = path.length === 0 ? treeRoot : (getNodeByPath(path) as CompositeNode);
		(node as CompositeNode).operator = op;
		treeRoot = { ...treeRoot };
	}
	function onChangeLeafField(path: number[], fieldId: string) {
		const parentPath = path.slice(0, -1);
		const parent =
			parentPath.length === 0 ? treeRoot : (getNodeByPath(parentPath) as CompositeNode);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		parent.children[idx] = { ...child, condition: { ...child.condition, field: fieldId } };
		treeRoot = { ...treeRoot };
	}
	function onChangeLeafOperator(path: number[], operator: string) {
		const parentPath = path.slice(0, -1);
		const parent =
			parentPath.length === 0 ? treeRoot : (getNodeByPath(parentPath) as CompositeNode);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		const nextVal =
			operator === 'Is Empty' || operator === 'Is Not Empty' ? '' : child.condition.value;
		parent.children[idx] = {
			...child,
			condition: { ...child.condition, operator, value: nextVal }
		};
		treeRoot = { ...treeRoot };
	}
	function onChangeLeafValue(path: number[], value: string) {
		const parentPath = path.slice(0, -1);
		const parent =
			parentPath.length === 0 ? treeRoot : (getNodeByPath(parentPath) as CompositeNode);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		parent.children[idx] = { ...child, condition: { ...child.condition, value } };
		treeRoot = { ...treeRoot };
	}
	function onChangeLeafName(path: number[], name: string) {
		const parentPath = path.slice(0, -1);
		const parent =
			parentPath.length === 0 ? treeRoot : (getNodeByPath(parentPath) as CompositeNode);
		const idx = path[path.length - 1];
		const child = parent.children[idx] as LogicalNode;
		if (!child || child.type !== 'logical') return;
		parent.children[idx] = { ...child, condition: { ...child.condition, name } };
		treeRoot = { ...treeRoot };
	}

	// Build operations bottom-up for the tree
	function getAllFields() {
		const arr: any[] = [];
		for (const section of questionList || []) for (const f of section.FormFields || []) arr.push(f);
		return arr;
	}
	async function createLogicalOperationFromNode(node: LogicalNode): Promise<string> {
		const condition = node.condition;
		const selectedField = getAllFields().find(
			(f) =>
				f.id === condition.field || f.Title === condition.field || f.DisplayCode === condition.field
		);
		if (!selectedField) throw new Error('Selected field not found');
		const operator = condition.operator;
		let operands: any[] = [];
		if (operator === 'Is Empty' || operator === 'Is Not Empty') {
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
			Name:
				condition.name && condition.name.trim().length > 0
					? condition.name
					: 'Calculation condition',
			Description: 'Logical condition for calculation',
			Operator: mapDisplayOperatorToBackend(operator),
			Operands: JSON.stringify(operands)
		};
		const res = await fetch('/api/server/operations/logical-operation', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		if (!res.ok) {
			toastMessage(data);
			throw new Error(data?.Message || 'Failed to create logical operation');
		}
		return data?.Data?.id as string;
	}
	function mapDisplayOperatorToBackend(op: string): string {
		switch (op) {
			case 'Is Empty':
			case 'Is Not Empty':
				return 'Exists';
			case 'Greater Than':
				return 'GreaterThan';
			case 'Less Than':
				return 'LessThan';
			case 'Equal To':
				return 'Equal';
			case 'Not Equal To':
				return 'NotEqual';
			case 'Contains':
				return 'Contains';
			case 'Does Not Contain':
				return 'DoesNotContain';
			case 'Greater Than or Equal':
				return 'GreaterThanOrEqual';
			case 'Less Than or Equal':
				return 'LessThanOrEqual';
			default:
				return 'Equal';
		}
	}
	async function createCompositionOperationFromNode(
		comp: CompositeNode,
		childIds: string[]
	): Promise<string> {
		const payload = {
			Name: 'Composite calculation',
			Description: 'Composite logical calculation',
			Operator: comp.operator === 'AND' ? 'And' : 'Or',
			Children: JSON.stringify(childIds)
		};
		const res = await fetch('/api/server/operations/composition-operation', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		if (!res.ok) {
			toastMessage(data);
			throw new Error(data?.Message || 'Failed to create composite operation');
		}
		return data?.Data?.id as string;
	}
	function pruneTree(node: LogicalNode | CompositeNode): LogicalNode | CompositeNode | null {
		if ((node as any).type === 'logical') {
			const c = (node as LogicalNode).condition;
			const hasField = !!c.field;
			const hasOperator = !!c.operator;
			const needsValue = !(c.operator === 'Is Empty' || c.operator === 'Is Not Empty');
			const hasValue = !needsValue || (c.value !== undefined && `${c.value}`.trim() !== '');
			return hasField && hasOperator && hasValue ? node : null;
		}
		const comp = node as CompositeNode;
		const pruned: Array<LogicalNode | CompositeNode> = [];
		for (const child of comp.children) {
			const p = pruneTree(child);
			if (p) pruned.push(p);
		}
		if (pruned.length === 0) return null;
		return { ...comp, children: pruned } as CompositeNode;
	}
	async function createOperationsForNode(node: LogicalNode | CompositeNode): Promise<string> {
		if ((node as any).type === 'logical')
			return await createLogicalOperationFromNode(node as LogicalNode);
		const comp = node as CompositeNode;
		const childIds: string[] = [];
		for (const child of comp.children) {
			childIds.push(await createOperationsForNode(child));
		}
		if (childIds.length === 1) return childIds[0];
		return await createCompositionOperationFromNode(comp, childIds);
	}

	function clearExpression() {
		expression = '';
		testResult = 'Expression cleared';
		resultClass = 'error';
	}

	function validateExpression() {
		if (expression.trim() === '') {
			testResult = 'Validation Error: Expression cannot be empty';
			resultClass = 'error';
			return;
		}

		// Simple validation - check for balanced parentheses
		const openParens = (expression.match(/\(/g) || []).length;
		const closeParens = (expression.match(/\)/g) || []).length;

		if (openParens !== closeParens) {
			testResult = 'Validation Error: Unbalanced parentheses';
			resultClass = 'error';
			return;
		}

		// Check for field references
		const fieldReferences = expression.match(/\{[^}]+\}/g);
		if (fieldReferences) {
			testResult = `Validation Success: Expression is valid. Found ${fieldReferences.length} field reference(s)`;
			resultClass = 'success';
		} else {
			testResult = 'Validation Warning: No field references found in expression';
			resultClass = 'error';
		}
	}

	function testExpression() {
		// Mock test with sample values
		const testValues = {
			quantity: 10,
			price: 25.99,
			discount: 5,
			shipping: 9.99,
			tax_rate: 8.5,
			weight: 2.5,
			age: 25
		};

		let testExpression = expression;

		// Replace field references with test values
		Object.keys(testValues).forEach((field) => {
			const regex = new RegExp(`{${field}}`, 'g');
			testExpression = testExpression.replace(regex, testValues[field]);
		});

		try {
			// Simple evaluation for demo purposes
			const result = eval(testExpression.replace(/\*/g, '*').replace(/\^/g, '**'));
			testResult = `Test Result: Expression: ${testExpression} = ${result.toFixed(2)}`;
			resultClass = 'success';
		} catch (error) {
			testResult = `Test Error: ${error.message}`;
			resultClass = 'error';
		}
	}

	function addConditionalCalculation() {
		conditionalCalculations.push({
			field: 'Quantity',
			operator: 'Greater Than',
			value: '',
			expression: ''
		});
	}

	function removeConditionalCalculation(index: number) {
		conditionalCalculations.splice(index, 1);
	}

	// --- API helpers for calculation logic ---
	async function ensureCalculationLogic() {
		if (currentField?.CalculateLogic?.id) return currentField.CalculateLogic.id;
		const res = await fetch('/api/server/logic/calculation-logic', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ FieldId: currentField?.id, Enabled: true })
		});
		const data = await res.json();
		toastMessage(data);
		if (res.ok && data?.Data?.id) return data.Data.id;
		throw new Error(data?.Message || 'Failed to create calculation logic');
	}

	// Helper: map field.ResponseType to operand data type expected by backend
	function mapResponseTypeToOperandDataType(rt: string): string {
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

	// Build backend-ready expression (variables without braces/hyphens) and variables map
	function prepareExpressionAndVariables(expr: string) {
		const tokenRegex = /\{([a-z0-9_\-]+)\}/gi;
		const foundTokens: string[] = [];
		let m: RegExpExecArray | null;
		while ((m = tokenRegex.exec(expr)) !== null) {
			const t = m[1].toLowerCase();
			if (!foundTokens.includes(t)) foundTokens.push(t);
		}

		// Utility to build hyphen slug from a label to match inserted tokens
		const toHyphenSlug = (s: string) =>
			(s || '')
				.toString()
				.trim()
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');

		// Normalize var name (identifiers) by converting hyphens to underscores and ensuring valid start
		const toVarName = (slug: string) => {
			let v = (slug || '')
				.toString()
				.toLowerCase()
				.replace(/[^a-z0-9_]+/g, '_')
				.replace(/_+/g, '_');
			if (/^[^a-z_]/.test(v)) v = `v_${v}`; // ensure starts with letter or _
			return v;
		};

		// Build variables map by matching tokens to fields
		const variables: Record<string, any> = {};
		for (const token of foundTokens) {
			let matchedField: any = null;
			outer: for (const section of questionList || []) {
				for (const f of section?.FormFields || []) {
					const tSlug = token;
					const fSlugTitle = toHyphenSlug(f?.Title || '');
					const fSlugCode = toHyphenSlug(f?.DisplayCode || '');
					if (tSlug === fSlugTitle || tSlug === fSlugCode) {
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

		// Create expression by replacing {token} with normalized varName and normalizing operators
		let backendExpr = expr.replace(/×/g, '*');
		for (const token of foundTokens) {
			const varName = toVarName(token);
			const re = new RegExp(`\\{${token}\\}`, 'gi');
			backendExpr = backendExpr.replace(re, varName);
		}

		return { backendExpr, variables };
	}

	async function createFunctionExpressionOperation(expr: string) {
		const { backendExpr, variables } = prepareExpressionAndVariables(expr || '');
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
		const data = await res.json();
		toastMessage(data);
		if (!res.ok) throw new Error(data?.Message || 'Failed to create function expression operation');
		return data?.Data?.id as string;
	}

	async function createCalculationRule(
		logicId: string,
		functionOperationId: string
	) {
		const payload = {
			Name: ruleName || 'Calculation Rule',
			Description: 'Field Calculation-rule Description',
			OperationType: 'FunctionExpression',
			BaseOperationId: functionOperationId,
			OperationId: functionOperationId,
			LogicId: logicId
		} as any;
		const res = await fetch('/api/server/rules/calculation-rule', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const data = await res.json();
		toastMessage(data);
		if (!res.ok) throw new Error(data?.Message || 'Failed to create calculation rule');
		return data?.Data?.id as string;
	}

	async function linkLogicToField(logicId: string) {
		const payload = { id: currentField?.id, CalculateLogicId: logicId };
		const fieldResponse = await fetch('/api/server/form-fields', {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
		const fieldData = await fieldResponse.json();
		toastMessage(fieldData);
		if (!fieldResponse.ok) throw new Error(fieldData?.Message || 'Failed to update form field');
	}

	async function handleSave(event) {
		event?.preventDefault();
		event?.stopPropagation();
		try {
			if (selectedCalcMode === 'expression') {
				if (exprRef && typeof exprRef.save === 'function') {
					await exprRef.save();
				} else {
					throw new Error('Expression component not ready');
				}
			} else {
				if (condRef && typeof condRef.save === 'function') {
					await condRef.save();
				} else {
					throw new Error('Conditional component not ready');
				}
			}
		} catch (e) {
			toastMessage({
				Message: (e as Error)?.message || 'Failed to save calculation rule',
				HttpCode: 500
			});
			return;
		}
		onSave?.({ ruleName, targetField, mode: selectedCalcMode });
	}

	function handleCancel(event) {
		event?.preventDefault();
		event?.stopPropagation();
		onCancel?.();
	}
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
		<!-- Modal -->
		<div class="max-h-[90vh] w-[95%] max-w-6xl overflow-y-auto rounded-lg bg-white shadow-2xl">
			<!-- Modal Header -->
			<div class="flex items-center justify-between rounded-t-lg bg-slate-700 p-5 text-white">
				<h2 class="text-lg font-semibold">Field Calculation Logic Builder</h2>
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
				<!-- Rule Name -->
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

				<!-- Target Field -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Target Field</Label>
					<Select.Root type="single" name="TargetField" bind:value={targetField}>
						<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
							{targetField || 'Select field to calculate'}
						</Select.Trigger>
						<Select.Content>
							{#each targetFields as field}
								<Select.Item value={field}>{field}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Calculation type selector (mirrors Validation: Regex vs Logical) -->
				<div class="mb-6">
					<Label class="mb-2 block font-semibold text-slate-700">Calculation Type</Label>
					<Select.Root type="single" bind:value={selectedCalcMode}>
						<Select.Trigger class="w-full rounded-md border-2 border-gray-200 p-3 text-sm">
							{selectedCalcMode === 'expression' ? 'Calculation Expression' : 'Conditional Logic'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="expression">Calculation Expression</Select.Item>
							<Select.Item value="conditional">Conditional Logic</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<!-- Function Expression above -->

				{#if selectedCalcMode === 'expression'}
					<CalculationExpression
						bind:this={exprRef}
						{ruleName}
						{questionList}
						{currentField}
						initialExpression={expression}
					/>
				{/if}

				{#if selectedCalcMode === 'conditional'}
					<CalculationConditional
						bind:this={condRef}
						{treeRoot}
						fields={questionList?.flatMap((s) => s.FormFields) || []}
						{operators}
						{collapsedByPath}
						{onAddLogical}
						{onAddGroup}
						{onRemove}
						{onChangeGroupOperator}
						{onChangeLeafField}
						{onChangeLeafOperator}
						{onChangeLeafValue}
						{onChangeLeafName}
						{onToggleCollapse}
						{ensureCalculationLogic}
						{createOperationsForNode}
						{pruneTree}
						{createCalculationRule}
						{linkLogicToField}
					/>
				{/if}

				<!-- Conditional Calculations (Only show when checkbox is checked) -->

				<!-- Calculation Settings -->
				<div class="mb-6 rounded-lg border-2 border-gray-200 bg-white p-5">
					<div class="mb-4 flex items-center gap-2">
						<Icon icon="lucide:settings" class="h-5 w-5" />
						<h3 class="font-semibold text-slate-700">Calculation Settings</h3>
					</div>
					<div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label class="mb-2 block font-semibold text-slate-700">Decimal Places</Label>
							<Select.Root type="single" name="DecimalPlaces" bind:value={decimalPlaces}>
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
							<Select.Root type="single" name="RoundingMethod" bind:value={roundingMethod}>
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
							<input type="checkbox" id="autoUpdate" bind:checked={autoUpdate} class="h-4 w-4" />
							<Label for="autoUpdate">Auto-update when dependent fields change</Label>
						</div>
						<div class="flex items-center gap-3">
							<input type="checkbox" id="showFormula" bind:checked={showFormula} class="h-4 w-4" />
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
					Save {selectedCalcMode === 'conditional' ? 'Conditional' : 'Expression'} Rule
				</Button>
			</div>
		</div>
	</div>
{/if}
