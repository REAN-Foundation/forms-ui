<script lang="ts">
    import { Button } from '../ui/button/index.js';
    import { Input } from '../ui/input/index.js';
    import { Label } from '../ui/label/index.js';
    import * as Select from '../ui/select/index.js';
    import Icon from '@iconify/svelte';

    // Props
    let { isOpen = $bindable(false), onSave, onCancel, editingRule = null, questionList } = $props();

    // State for form data
    let ruleName = $state('Total Price Calculation');
    let targetField = $state('Total Price');
    let expression = $state('({quantity} * {price}) - (({quantity} * {price}) * {discount} / 100) + ({shipping})');
    let decimalPlaces = $state('2');
    let roundingMethod = $state('Round to nearest');
    let autoUpdate = $state(true);
    let showFormula = $state(false);
    let allowManualOverride = $state(false);
    let numberFormat = $state('number');
    let testResult = $state('Expression: (10 * 25.99) - ((10 * 25.99) * 5 / 100) + (9.99) = 272.89');
    let resultClass = $state('success');
    let fallbackExpression = $state('{quantity} * {price}');
    let field_name = $state('Quantity');
    let field1 = $state('Quantity');
    let field2 = $state('Price');
    let condition = $state('Quantity');
    let value_if_true = $state('10');
    let value_if_false = $state('20');
    let date1 = $state('2021-01-01');
    let date2 = $state('2021-01-02');
    // Conditional calculations
    let conditionalCalculations = $state([
        { field: 'Quantity', operator: 'Greater Than', value: '10', expression: '{quantity} * {price} * 0.9' }
    ]);

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
    const targetFields = ['Total Price', 'Tax Amount', 'Discount Amount', 'Final Total', 'Age in Days', 'BMI', 'Commission'];
    const operators = ['Greater Than', 'Less Than', 'Equal To', 'Not Equal To', 'Greater Than or Equal', 'Less Than or Equal'];
    const roundingMethods = ['Round to nearest', 'Round up', 'Round down', 'Truncate'];
    const numberFormats = ['number', 'currency', 'percentage', 'scientific'];

    // Initialize form data when editing an existing rule
    $effect(() => {
        if (editingRule) {
            ruleName = editingRule.ruleName || '';
            targetField = editingRule.targetField || '';
            expression = editingRule.expression || '';
            decimalPlaces = editingRule.decimalPlaces?.toString() || '2';
            numberFormat = editingRule.numberFormat || 'number';
            conditionalCalculations = editingRule.conditionalCalculations || [];
        }
    });

    function insertField(fieldName: string) {
        const field = fields.find(f => f.name === fieldName);
        if (field) {
            expression += `{${fieldName.toLowerCase().replace(/\s+/g, '_')}}`;
        }
    }

    function insertOperator(operator: string) {
        expression += ` ${operator} `;
    }

    function insertFunction(functionName: string) {
        expression += `${functionName}()`;
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
        Object.keys(testValues).forEach(field => {
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
        conditionalCalculations.push({ field: 'Quantity', operator: 'Greater Than', value: '', expression: '' });
    }

    function removeConditionalCalculation(index: number) {
        conditionalCalculations.splice(index, 1);
    }

    function handleSave(event) {
        event?.preventDefault();
        event?.stopPropagation();
        const calculationData = {
            ruleName,
            targetField,
            expression,
            decimalPlaces,
            roundingMethod,
            autoUpdate,
            showFormula,
            allowManualOverride,
            numberFormat,
            conditionalCalculations,
            fallbackExpression
        };
        onSave?.(calculationData);
    }

    function handleCancel(event) {
        event?.preventDefault();
        event?.stopPropagation();
        onCancel?.();
    }
</script>

{#if isOpen}
    <!-- Modal Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]">
        <!-- Modal -->
        <div class="bg-white rounded-lg w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Modal Header -->
            <div class="bg-slate-700 text-white p-5 rounded-t-lg flex justify-between items-center">
                <h2 class="text-lg font-semibold">Field Calculation Logic Builder</h2>
                <button type="button" class="text-white text-2xl p-1 hover:bg-slate-600 rounded" onclick={handleCancel}>
                    ×
                </button>
            </div>
            
            <!-- Modal Body -->
            <div class="p-8">
                <!-- Rule Name -->
                <div class="mb-6">
                    <Label class="block mb-2 font-semibold text-slate-700">Rule Name</Label>
                    <Input 
                        bind:value={ruleName}
                        placeholder="Enter rule name"
                        class="w-full p-3 border-2 border-gray-200 rounded-md text-sm focus:border-blue-500"
                    />
                    <div class="text-xs text-gray-500 mt-1">(Maximum 100 characters)</div>
                </div>

                <!-- Target Field -->
                <div class="mb-6">
                    <Label class="block mb-2 font-semibold text-slate-700">Target Field</Label>
                    <Select.Root type="single" name="TargetField" bind:value={targetField}>
                        <Select.Trigger class="w-full p-3 border-2 border-gray-200 rounded-md text-sm">
                            {targetField || 'Select field to calculate'}
                        </Select.Trigger>
                        <Select.Content>
                            {#each targetFields as field}
                                <Select.Item value={field}>{field}</Select.Item>
                            {/each}
                        </Select.Content>
                    </Select.Root>
                </div>

                <!-- Calculation Builder -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Available Fields -->
                    <div class="bg-gray-50 rounded-lg p-5">
                        <div class="flex items-center gap-2 mb-4">
                            <Icon icon="lucide:database" class="h-5 w-5" />
                            <h3 class="font-semibold text-slate-700">Available Fields</h3>
                        </div>
                        <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
                            {#each fields as field}
                                <button 
                                    type="button"
                                    class="w-full p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center text-left"
                                    onclick={() => insertField(field.name)}
                                    onkeydown={(e) => e.key === 'Enter' && insertField(field.name)}
                                >
                                    <span class="font-medium">{field.name}</span>
                                    <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{field.type}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Operators and Functions -->
                    <div class="bg-gray-50 rounded-lg p-5">
                        <div class="flex items-center gap-2 mb-4">
                            <Icon icon="lucide:calculator" class="h-5 w-5" />
                            <h3 class="font-semibold text-slate-700">Mathematical Operators</h3>
                        </div>
                        <div class="grid grid-cols-4 gap-2 mb-4">
                            {#each ['+', '-', '×', '/', '%', '^', '(', ')'] as operator}
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm"
                                    onclick={() => insertOperator(operator)}
                                    class="font-semibold"
                                >
                                    {operator}
                                </Button>
                            {/each}
                        </div>

                        <div class="flex items-center gap-2 mb-4">
                            <Icon icon="lucide:function" class="h-5 w-5" />
                            <h3 class="font-semibold text-slate-700">Functions</h3>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            {#each ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'CEILING', 'FLOOR', 'ABS', 'SQRT', 'IF', 'DATEDIFF'] as func}
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    size="sm"
                                    onclick={() => insertFunction(func)}
                                    class="text-xs"
                                >
                                    {func}
                                </Button>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Expression Builder -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-5 mb-6">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:zap" class="h-5 w-5" />
                        <h3 class="font-semibold text-slate-700">Expression Builder</h3>
                    </div>
                    <textarea 
                        bind:value={expression}
                        placeholder="Build your calculation expression here..."
                        class="w-full p-4 border border-gray-300 rounded-md font-mono text-sm bg-gray-50 min-h-32 resize-y"
                    ></textarea>
                    
                    <div class="flex gap-3 mt-3">
                        <Button type="button" variant="outline" size="sm" onclick={clearExpression}>
                            Clear
                        </Button>
                        <Button type="button" variant="outline" size="sm" onclick={validateExpression}>
                            Validate
                        </Button>
                        <Button type="button" onclick={testExpression} class="bg-blue-600 hover:bg-blue-700">
                            Test
                        </Button>
                    </div>
                    
                    <div class="mt-4 p-4 rounded-md {resultClass === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
                        <div class="font-semibold mb-2">Preview Result:</div>
                        <div class="font-mono text-sm">{testResult}</div>
                    </div>

                    <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                        <strong>Syntax Help:</strong><br>
                        • Use {field_name} to reference fields<br>
                        • Mathematical operators: +, -, *, /, %, ^<br>
                        • Functions: <span class="font-mono bg-gray-200 px-1 rounded">SUM({field1}, {field2})</span>, <span class="font-mono bg-gray-200 px-1 rounded">IF({condition}, {value_if_true}, {value_if_false})</span><br>
                        • Date functions: <span class="font-mono bg-gray-200 px-1 rounded">DATEDIFF({date1}, {date2}, 'days')</span>
                    </div>
                </div>

                <!-- Calculation Settings -->
                <div class="bg-white border-2 border-gray-200 rounded-lg p-5 mb-6">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:settings" class="h-5 w-5" />
                        <h3 class="font-semibold text-slate-700">Calculation Settings</h3>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <Label class="block mb-2 font-semibold text-slate-700">Decimal Places</Label>
                            <Select.Root type="single" name="DecimalPlaces" bind:value={decimalPlaces}>
                                <Select.Trigger class="w-full p-3 border-2 border-gray-200 rounded-md text-sm">
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
                            <Label class="block mb-2 font-semibold text-slate-700">Rounding Method</Label>
                            <Select.Root type="single" name="RoundingMethod" bind:value={roundingMethod}>
                                <Select.Trigger class="w-full p-3 border-2 border-gray-200 rounded-md text-sm">
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
                    
                    <div class="space-y-3 mb-4">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="autoUpdate" bind:checked={autoUpdate} class="h-4 w-4" />
                            <Label for="autoUpdate">Auto-update when dependent fields change</Label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="showFormula" bind:checked={showFormula} class="h-4 w-4" />
                            <Label for="showFormula">Show formula to users</Label>
                        </div>
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="allowManualOverride" bind:checked={allowManualOverride} class="h-4 w-4" />
                            <Label for="allowManualOverride">Allow manual override</Label>
                        </div>
                    </div>

                    <div>
                        <Label class="block mb-2 font-semibold text-slate-700">Number Format</Label>
                        <div class="flex gap-2">
                            {#each numberFormats as format}
                                <Button 
                                    type="button"
                                    variant={numberFormat === format ? 'default' : 'outline'}
                                    size="sm"
                                    onclick={() => numberFormat = format}
                                    class="text-xs"
                                >
                                    {format === 'number' ? '1,234.56' : 
                                     format === 'currency' ? '$1,234.56' : 
                                     format === 'percentage' ? '12.34%' : '1.23e+3'}
                                </Button>
                            {/each}
                        </div>
                    </div>
                </div>

                <!-- Conditional Calculations -->
                <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-5 mb-6">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:git-branch" class="h-5 w-5" />
                        <h3 class="font-semibold text-yellow-800">Conditional Calculations (Optional)</h3>
                    </div>
                    {#each conditionalCalculations as condition, index}
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-sm font-medium">IF</span>
                            <Select.Root type="single" name="ConditionField" bind:value={condition.field}>
                                <Select.Trigger class="min-w-[120px] p-2 border border-gray-300 rounded text-sm">
                                    {condition.field}
                                </Select.Trigger>
                                <Select.Content>
                                    {#each fields as field}
                                        <Select.Item value={field.name}>{field.name}</Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                            <Select.Root type="single" name="ConditionOperator" bind:value={condition.operator}>
                                <Select.Trigger class="min-w-[140px] p-2 border border-gray-300 rounded text-sm">
                                    {condition.operator}
                                </Select.Trigger>
                                <Select.Content>
                                    {#each operators as operator}
                                        <Select.Item value={operator}>{operator}</Select.Item>
                                    {/each}
                                </Select.Content>
                            </Select.Root>
                            <Input 
                                bind:value={condition.value}
                                placeholder="Value"
                                class="min-w-[100px] p-2 border border-gray-300 rounded text-sm"
                            />
                            <span class="text-sm font-medium">THEN</span>
                            <Button 
                                type="button"
                                variant="destructive"
                                size="sm"
                                onclick={() => removeConditionalCalculation(index)}
                                class="text-xs"
                            >
                                Remove
                            </Button>
                        </div>
                        <div class="bg-gray-100 border border-gray-200 rounded p-3 mb-3">
                            <textarea 
                                bind:value={condition.expression}
                                placeholder="Enter expression for this condition"
                                class="w-full p-2 border border-gray-300 rounded text-sm font-mono"
                                rows="2"
                            ></textarea>
                        </div>
                    {/each}
                    <Button 
                        type="button"
                        onclick={addConditionalCalculation}
                        class="bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1 hover:bg-green-700"
                    >
                        <Icon icon="lucide:plus" class="h-4 w-4" />
                        Add Condition
                    </Button>
                </div>

                <!-- Fallback Section -->
                <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-5">
                    <div class="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:shield" class="h-5 w-5" />
                        <h3 class="font-semibold text-yellow-800">Default Calculation (Fallback)</h3>
                    </div>
                    <textarea 
                        bind:value={fallbackExpression}
                        placeholder="Enter default calculation expression"
                        class="w-full p-3 border-2 border-gray-200 rounded-md text-sm font-mono"
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-8 py-5 border-t border-gray-200 flex justify-end gap-2">
                <Button 
                    type="button"
                    onclick={handleCancel}
                    variant="outline"
                    class="px-6 py-3 bg-gray-50 text-gray-600 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-100"
                >
                    Cancel
                </Button>
                <Button 
                    type="button"
                    onclick={handleSave}
                    class="px-6 py-3 bg-slate-700 text-white rounded-md text-sm font-semibold hover:bg-slate-800"
                >
                    Save Calculation Rule
                </Button>
            </div>
        </div>
    </div>
{/if} 