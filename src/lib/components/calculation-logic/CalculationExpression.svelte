<script lang="ts">
	import { Button } from '../ui/button/index.js';
	import Icon from '@iconify/svelte';
	import { toastMessage } from '../toast/toast.store.js';

	// Props from parent
	let { ruleName = $bindable(''), questionList, currentField, initialExpression = '' } = $props();

	// State
	let expression = $state('');
	$effect(() => {
		expression = initialExpression || '';
	});
	let expressionTextarea = $state<HTMLTextAreaElement | null>(null);
	let testResult = $state('');
	let resultClass = $state('');

	// expose save method to parent
	export function save() {
		return doSave();
	}

	// Helpers
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
		const raw = (field?.Title || field?.DisplayCode || '').toString();
		const base = raw.trim().toLowerCase();
		const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		return `{${slug}}`;
	}
	function insertFieldFromQuestion(field: any) {
		insertTokenAtCaret(normalizeFieldTokenFromQuestion(field));
	}
	function insertOperator(operator: string) {
		insertTokenAtCaret(` ${operator} `);
	}
	function insertFunction(functionName: string) {
		insertTokenAtCaret(`${functionName}()`, functionName.length + 1);
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
		const openParens = (expression.match(/\(/g) || []).length;
		const closeParens = (expression.match(/\)/g) || []).length;
		if (openParens !== closeParens) {
			testResult = 'Validation Error: Unbalanced parentheses';
			resultClass = 'error';
			return;
		}
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
		const testValues: any = {
			quantity: 10,
			price: 25.99,
			discount: 5,
			shipping: 9.99,
			tax_rate: 8.5,
			weight: 2.5,
			age: 25
		};
		let testExpression = expression;
		Object.keys(testValues).forEach((field) => {
			const regex = new RegExp(`{${field}}`, 'g');
			testExpression = testExpression.replace(regex, testValues[field]);
		});
		try {
			const result = eval(testExpression.replace(/\*/g, '*').replace(/\^/g, '**'));
			testResult = `Test Result: Expression: ${testExpression} = ${Number(result).toFixed(2)}`;
			resultClass = 'success';
		} catch (error: any) {
			testResult = `Test Error: ${error.message}`;
			resultClass = 'error';
		}
	}

	// API helpers
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
	function prepareExpressionAndVariables(expr: string) {
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
	async function createCalculationRule(logicId: string, functionOperationId: string) {
		const payload: any = {
			Name: ruleName || 'Calculation Rule',
			Description: 'Field Calculation-rule Description',
			OperationType: 'FunctionExpression',
			BaseOperationId: functionOperationId,
			OperationId: functionOperationId,
			LogicId: logicId
		};
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

	function doSave() {
		if (!expression || !expression.trim()) {
			toastMessage({ Message: 'Expression is required', HttpCode: 400 });
			throw new Error('Expression is required');
		}
		return (async () => {
			const logicId = await ensureCalculationLogic();
			const functionOpId = await createFunctionExpressionOperation(expression || '');
			await createCalculationRule(logicId, functionOpId);
			await linkLogicToField(logicId);
		})();
	}
</script>

<!-- Available Fields, Operators/Functions -->
<div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
	<div class="rounded-lg border-2 border-gray-200 bg-gray-50 p-5">
		<div class="mb-4 flex items-center gap-2">
			<Icon icon="lucide:database" class="h-5 w-5 text-gray-700" />
			<h3 class="font-semibold text-slate-700">Available Fields</h3>
		</div>
		<div class="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white">
			{#each questionList as section}
				{#each section.FormFields as f}
					<button
						type="button"
						class="flex w-full cursor-pointer items-center justify-between border-b border-gray-100 p-3 text-left transition-colors hover:bg-blue-50"
						onclick={() => insertFieldFromQuestion(f)}
						onkeydown={(e) => e.key === 'Enter' && insertFieldFromQuestion(f)}
					>
						<span class="font-medium">{f.Title || f.DisplayCode}</span>
						<span class="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-500"
							>{f.ResponseType}</span
						>
					</button>
				{/each}
			{/each}
		</div>
	</div>
	<div class="rounded-lg border-2 border-gray-200 bg-gray-50 p-5">
		<div class="mb-4 flex items-center gap-2">
			<Icon icon="lucide:calculator" class="h-5 w-5 text-gray-700" />
			<h3 class="font-semibold text-slate-700">Mathematical Operators</h3>
		</div>
		<div class="mb-4 grid grid-cols-4 gap-2">
			{#each ['+', '-', '×', '/', '%', '^', '(', ')'] as operator}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => insertOperator(operator)}
					class="font-semibold hover:border-blue-300 hover:bg-blue-50">{operator}</Button
				>
			{/each}
		</div>
		<div class="mb-4 flex items-center gap-2">
			<Icon icon="lucide:function-square" class="h-5 w-5 text-gray-700" />
			<h3 class="font-semibold text-slate-700">Functions</h3>
		</div>
		<div class="grid grid-cols-2 gap-2">
			{#each ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'CEILING', 'FLOOR', 'ABS', 'SQRT', 'IF', 'DATEDIFF'] as func}
				<Button
					type="button"
					variant="outline"
					size="sm"
					onclick={() => insertFunction(func)}
					class="text-xs hover:border-blue-300 hover:bg-blue-50">{func}</Button
				>
			{/each}
		</div>
	</div>
</div>

<!-- Expression Builder -->
<div class="mb-6 rounded-lg border-2 border-gray-300 bg-white p-5 shadow-sm">
	<div class="mb-4 flex items-center gap-2">
		<Icon icon="lucide:code" class="h-5 w-5 text-gray-700" />
		<h3 class="font-semibold text-slate-700">Calculation Expression</h3>
	</div>
	<textarea
		bind:value={expression}
		bind:this={expressionTextarea}
		placeholder="Build your calculation expression here..."
		class="min-h-32 w-full resize-y rounded-md border-2 border-gray-300 bg-gray-50 p-4 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
	></textarea>
	<div class="mt-3 flex gap-3">
		<Button type="button" variant="outline" size="sm" onclick={clearExpression}
			><Icon icon="lucide:eraser" class="mr-1 h-4 w-4" />Clear</Button
		>
		<Button type="button" variant="outline" size="sm" onclick={validateExpression}
			><Icon icon="lucide:check-circle" class="mr-1 h-4 w-4" />Validate</Button
		>
		<Button type="button" onclick={testExpression} class="bg-blue-600 hover:bg-blue-700"
			><Icon icon="lucide:play" class="mr-1 h-4 w-4" />Test</Button
		>
	</div>
	<div
		class="mt-4 rounded-md border-2 p-4 {resultClass === 'success'
			? 'border-green-300 bg-green-50'
			: 'border-red-300 bg-red-50'}"
	>
		<div class="mb-2 flex items-center gap-2 font-semibold">
			<Icon
				icon={resultClass === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'}
				class="h-4 w-4"
			/>Preview Result:
		</div>
		<div class="font-mono text-sm">{testResult}</div>
	</div>
	<div class="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs">
		<strong>Syntax Help:</strong><br />
		• Use {'{field_name}'} to reference fields<br />
		• Mathematical operators: +, -, *, /, %, ^<br />
		• Functions:
		<span class="rounded bg-gray-200 px-1 font-mono">SUM({'{field1}'}, {'{field2}'})</span>,
		<span class="rounded bg-gray-200 px-1 font-mono"
			>IF({'{condition}'}, {'{value_if_true}'}, {'{value_if_false}'})</span
		><br />
		• Date functions:
		<span class="rounded bg-gray-200 px-1 font-mono"
			>DATEDIFF({'{date1}'}, {'{date2}'}, 'days')</span
		>
	</div>
</div>
