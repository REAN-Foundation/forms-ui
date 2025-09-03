 <script lang="ts">
	import { Button } from '../ui/button/index.js';
	import { Label } from '../ui/label/index.js';
	import Icon from '@iconify/svelte';

	// Props
	let {
		expression = $bindable(),
		onExpressionChange = undefined as ((value: string) => void) | undefined,
		fields = [] as Array<{ id: string; Title?: string; DisplayCode?: string; ResponseType?: string }>,
		placeholder = 'Enter calculation expression...',
		size = 'default' as 'small' | 'default' | 'large',
		showValidation = true,
		readonly = false
	} = $props();

	// Ensure expression is always a string
	if (expression === undefined || expression === null) {
		expression = '';
	}

	// Handle both binding and callback patterns
	function updateExpression(newValue: string) {
		if (onExpressionChange) {
			onExpressionChange(newValue);
		} else {
			expression = newValue;
		}
	}

	// State
	let expressionTextarea = $state<HTMLTextAreaElement | null>(null);
	let testResult = $state('');
	let resultClass = $state('');

	// Size configurations
	const sizeConfig = {
		small: {
			containerClass: 'p-3',
			headerText: 'text-xs font-medium',
			buttonSize: 'sm' as const,
			buttonClass: 'px-2 py-1 text-xs',
			textareaClass: 'min-h-16 text-xs',
			gridCols: 'grid-cols-6',
			iconSize: 'h-3 w-3'
		},
		default: {
			containerClass: 'p-4',
			headerText: 'text-sm font-semibold',
			buttonSize: 'sm' as const,
			buttonClass: 'px-3 py-1.5 text-sm',
			textareaClass: 'min-h-24 text-sm',
			gridCols: 'grid-cols-4',
			iconSize: 'h-4 w-4'
		},
		large: {
			containerClass: 'p-5',
			headerText: 'text-base font-semibold',
			buttonSize: 'default' as const,
			buttonClass: 'px-4 py-2 text-sm',
			textareaClass: 'min-h-32 text-sm',
			gridCols: 'grid-cols-4',
			iconSize: 'h-5 w-5'
		}
	};

	const config = $derived(sizeConfig[size]);

	// Helper functions
	function insertTokenAtCaret(token: string, caretOffsetFromStart?: number) {
		const el = expressionTextarea;
		const currentExpression = expression || '';
		if (el && typeof el.selectionStart === 'number') {
			const start = el.selectionStart;
			const end = el.selectionEnd;
			const newExpression = `${currentExpression.slice(0, start)}${token}${currentExpression.slice(end)}`;
			updateExpression(newExpression);
			
			// Set cursor position after token insertion
			setTimeout(() => {
				try {
					const offset = typeof caretOffsetFromStart === 'number' 
						? caretOffsetFromStart 
						: token.length;
					el.selectionStart = el.selectionEnd = start + offset;
					el.focus();
				} catch {}
			});
		} else {
			updateExpression(currentExpression + token);
		}
	}

	function normalizeFieldToken(field: any): string {
		const raw = (field?.Title || field?.DisplayCode || '').toString();
		const base = raw.trim().toLowerCase();
		const slug = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		return `{${slug}}`;
	}

	function insertField(field: any) {
		insertTokenAtCaret(normalizeFieldToken(field));
	}

	function insertOperator(operator: string) {
		insertTokenAtCaret(` ${operator} `);
	}

	function insertFunction(functionName: string) {
		insertTokenAtCaret(`${functionName}()`, functionName.length + 1);
	}

	function clearExpression() {
		updateExpression('');
		testResult = '';
		resultClass = '';
	}

	function validateExpression() {
		if (!expression.trim()) {
			testResult = 'Expression cannot be empty';
			resultClass = 'error';
			return;
		}

		const openParens = (expression.match(/\(/g) || []).length;
		const closeParens = (expression.match(/\)/g) || []).length;
		
		if (openParens !== closeParens) {
			testResult = 'Unbalanced parentheses';
			resultClass = 'error';
			return;
		}

		const fieldReferences = expression.match(/\{[^}]+\}/g);
		if (fieldReferences) {
			testResult = `Valid expression with ${fieldReferences.length} field reference(s)`;
			resultClass = 'success';
		} else {
			testResult = 'No field references found';
			resultClass = 'warning';
		}
	}

	// Math operators and functions
	const mathOperators = ['+', '-', '×', '/', '%', '^', '(', ')'];
	const mathFunctions = ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'CEILING', 'FLOOR', 'ABS', 'SQRT', 'IF'];
</script>

<div class="rounded-lg border border-gray-200 bg-white {config.containerClass}">
	<!-- Header -->
	<div class="mb-3 flex items-center gap-2">
		<Icon icon="lucide:calculator" class="{config.iconSize} text-gray-600" />
		<h4 class="{config.headerText} text-gray-700">Expression Builder</h4>
	</div>

	<!-- Available Fields Section -->
	{#if fields.length > 0}
		<div class="mb-4">
			<div class="mb-2 flex items-center gap-1">
				<Icon icon="lucide:database" class="{config.iconSize} text-blue-600" />
				<span class="text-xs font-medium text-gray-700">Fields</span>
			</div>
			<div class="max-h-24 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2">
				<div class="flex flex-wrap gap-1">
					{#each fields as field}
						<button
							type="button"
							onclick={() => insertField(field)}
							class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200 transition-colors"
							disabled={readonly}
						>
							{field.Title || field.DisplayCode}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Operators Section -->
	<div class="mb-4">
		<div class="mb-2 flex items-center gap-1">
			<Icon icon="lucide:plus-minus" class="{config.iconSize} text-green-600" />
			<span class="text-xs font-medium text-gray-700">Operators</span>
		</div>
		<div class="grid {config.gridCols} gap-1">
			{#each mathOperators as operator}
				<button
					type="button"
					onclick={() => insertOperator(operator)}
					class="rounded border border-gray-300 bg-white {config.buttonClass} font-mono hover:bg-gray-50 transition-colors"
					disabled={readonly}
				>
					{operator}
				</button>
			{/each}
		</div>
	</div>

	<!-- Functions Section -->
	<div class="mb-4">
		<div class="mb-2 flex items-center gap-1">
			<Icon icon="lucide:function-square" class="{config.iconSize} text-purple-600" />
			<span class="text-xs font-medium text-gray-700">Functions</span>
		</div>
		<div class="grid grid-cols-3 gap-1">
			{#each mathFunctions as func}
				<button
					type="button"
					onclick={() => insertFunction(func)}
					class="rounded border border-gray-300 bg-white {config.buttonClass} hover:bg-gray-50 transition-colors"
					disabled={readonly}
				>
					{func}
				</button>
			{/each}
		</div>
	</div>

	<!-- Expression Input -->
	<div class="mb-3">
		<Label class="mb-2 block text-xs font-medium text-gray-700">Expression</Label>
		<textarea
			bind:this={expressionTextarea}
			value={expression}
			oninput={(e) => updateExpression((e.currentTarget as HTMLTextAreaElement).value)}
			{placeholder}
			class="w-full resize-y rounded-md border border-gray-300 bg-gray-50 {config.textareaClass} p-3 font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
			{readonly}
		></textarea>
	</div>

	<!-- Action Buttons -->
	{#if !readonly}
		<div class="flex items-center gap-2">
			{#if showValidation}
				<Button
					type="button"
					variant="secondary"
					size={config.buttonSize}
					onclick={validateExpression}
				>
					<Icon icon="mdi:check-circle" class="h-3 w-3" />
					Validate
				</Button>
			{/if}
			<Button
				type="button"
				variant="outline"
				size={config.buttonSize}
				onclick={clearExpression}
			>
				<Icon icon="mdi:close" class="h-3 w-3" />
				Clear
			</Button>
		</div>
	{/if}

	<!-- Validation Result -->
	{#if showValidation && testResult}
		<div class="mt-2 text-xs" 
			class:text-green-600={resultClass === 'success'} 
			class:text-red-600={resultClass === 'error'}
			class:text-yellow-600={resultClass === 'warning'}
		>
			{testResult}
		</div>
	{/if}
</div>
