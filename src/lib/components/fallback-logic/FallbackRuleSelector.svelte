<script lang="ts">
    import { onMount } from 'svelte';
    import { FallbackActionType } from '../submission/engine/types/fallback-rule';
    import { Button } from '../ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
    import { Input } from '../ui/input';
    import { Label } from '../ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
    import { Textarea } from '../ui/textarea';
    import { Checkbox } from '../ui/checkbox';
    import { Badge } from '../ui/badge';
    import { Plus, Edit, Trash2, X, Save } from 'lucide-svelte';
    // No imports needed - we'll use fetch directly

    let {
        baseOperationId = '',
        selectedFallbackRuleId = $bindable(''),
        onFallbackRuleChange = () => {}
    } = $props();

    let fallbackRules: any[] = $state([]);
    let loading = $state(false);
    let error = $state('');
    let showCreateForm = $state(false);
    let editingRule: any = $state(null);

    // Form data
    let formData = $state({
        name: '',
        description: '',
        priority: '1',
        isActive: true,
        operationType: 'Logical',
        action: FallbackActionType.SHOW_MESSAGE,
        actionMessage: '',
        maxAttempts: '3',
        delay: '1000'
    });

    onMount(() => {
        if (baseOperationId) {
            loadFallbackRules();
        }
    });

    $effect(() => {
        if (baseOperationId) {
            loadFallbackRules();
        }
    });

    async function loadFallbackRules() {
        if (!baseOperationId) return;
        
        loading = true;
        error = '';
        try {
            const response = await fetch(`/api/server/rules/fallback-rule?BaseOperationId=${baseOperationId}`);
            const result = await response.json();
            
            if (response.ok) {
                fallbackRules = result.Data || result || [];
            } else {
                error = result.message || 'Failed to load fallback rules';
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function startCreate() {
        editingRule = null;
        showCreateForm = true;
        resetForm();
    }

    function startEdit(rule: any) {
        editingRule = rule;
        showCreateForm = true;
        formData = {
            name: rule.Name || '',
            description: rule.Description || '',
            priority: String(rule.Priority || 1),
            isActive: rule.IsActive !== false,
            operationType: rule.OperationType || 'Logical',
            action: rule.Action || FallbackActionType.SHOW_MESSAGE,
            actionMessage: rule.ActionMessage || '',
            maxAttempts: String(rule.ActionParameters?.maxAttempts || 3),
            delay: String(rule.ActionParameters?.delay || 1000)
        };
    }

    function cancelEdit() {
        showCreateForm = false;
        editingRule = null;
        resetForm();
    }

    function resetForm() {
        formData = {
            name: '',
            description: '',
            priority: '1',
            isActive: true,
            operationType: 'Logical',
            action: FallbackActionType.SHOW_MESSAGE,
            actionMessage: '',
            maxAttempts: '3',
            delay: '1000'
        };
    }

    async function saveRule() {
        if (!formData.name.trim()) {
            error = 'Rule name is required';
            return;
        }

        loading = true;
        error = '';

        try {
            const ruleData = {
                Name: formData.name,
                Description: formData.description,
                Priority: parseInt(formData.priority) || 1,
                IsActive: formData.isActive,
                OperationType: formData.operationType,
                BaseOperationId: baseOperationId || '',
                Action: formData.action,
                ActionMessage: formData.actionMessage,
                ActionParameters: formData.action === FallbackActionType.RETRY ? {
                    maxAttempts: parseInt(formData.maxAttempts) || 3,
                    delay: parseInt(formData.delay) || 1000,
                    retryCount: 0
                } : formData.action === FallbackActionType.SET_DEFAULT ? {
                    timeout: 3,
                    maxRetries: 5000
                } : {}
            };

            let response;
            if (editingRule) {
                response = await fetch(`/api/server/rules/fallback-rule/${editingRule.id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(ruleData)
                });
            } else {
                response = await fetch('/api/server/rules/fallback-rule', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(ruleData)
                });
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save fallback rule');
            }

            await loadFallbackRules();
            cancelEdit();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    async function deleteRule(ruleId: string) {
        if (!confirm('Are you sure you want to delete this fallback rule?')) {
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`/api/server/rules/fallback-rule/${ruleId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete fallback rule');
            }
            
            await loadFallbackRules();
            
            // If the deleted rule was selected, clear selection
            if (selectedFallbackRuleId === ruleId) {
                selectedFallbackRuleId = '';
                onFallbackRuleChange('');
            }
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    }

    function selectRule(ruleId: string) {
        selectedFallbackRuleId = ruleId;
        onFallbackRuleChange(ruleId);
    }

    function getActionLabel(action: string): string {
        switch (action) {
            case FallbackActionType.SET_DEFAULT:
                return 'Set Default';
            case FallbackActionType.SHOW_MESSAGE:
                return 'Show Message';
            case FallbackActionType.SKIP_FIELD:
                return 'Skip Field';
            case FallbackActionType.RETRY:
                return 'Retry';
            case FallbackActionType.CLEAR_FIELD:
                return 'Clear Field';
            case FallbackActionType.DISABLE_FIELD:
                return 'Disable Field';
            default:
                return action;
        }
    }

    function getActionColor(action: string): string {
        switch (action) {
            case FallbackActionType.SET_DEFAULT:
                return 'bg-blue-100 text-blue-800';
            case FallbackActionType.SHOW_MESSAGE:
                return 'bg-yellow-100 text-yellow-800';
            case FallbackActionType.SKIP_FIELD:
                return 'bg-gray-100 text-gray-800';
            case FallbackActionType.RETRY:
                return 'bg-green-100 text-green-800';
            case FallbackActionType.CLEAR_FIELD:
                return 'bg-red-100 text-red-800';
            case FallbackActionType.DISABLE_FIELD:
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
</script>

<div class="space-y-4">
    <div class="flex justify-between items-center">
        <h4 class="text-sm font-medium text-gray-700">Fallback Rules</h4>
        <Button type="button" size="sm" onclick={startCreate} class="flex items-center gap-1">
            <Plus class="w-3 h-3" />
            Add
        </Button>
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
        </div>
    {/if}

    {#if showCreateForm}
        <Card class="border-2">
            <CardHeader class="pb-3">
                <CardTitle class="text-sm">{editingRule ? 'Edit' : 'Create'} Fallback Rule</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <Label for="name" class="text-xs">Rule Name *</Label>
                        <Input
                            id="name"
                            bind:value={formData.name}
                            placeholder="Enter rule name"
                            class="text-sm"
                        />
                    </div>
                    <div>
                        <Label for="priority" class="text-xs">Priority</Label>
                        <Input
                            id="priority"
                            type="number"
                            bind:value={formData.priority}
                            min="1"
                            class="text-sm"
                        />
                    </div>
                </div>

                <div>
                    <Label for="description" class="text-xs">Description</Label>
                    <Textarea
                        id="description"
                        bind:value={formData.description}
                        placeholder="Enter rule description"
                        class="text-sm"
                        rows={2}
                    />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <Label for="operationType" class="text-xs">Operation Type</Label>
                        <Select 
                            type="single"
                            bind:value={formData.operationType}
                            items={[
                                { value: 'Logical', label: 'Logical' },
                                { value: 'Composite', label: 'Composite' },
                                { value: 'FunctionExpression', label: 'Function Expression' }
                            ]}
                        >
                            <SelectTrigger class="text-sm">
                                <span>{formData.operationType || 'Select operation type'}</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Logical">Logical</SelectItem>
                                <SelectItem value="Composite">Composite</SelectItem>
                                <SelectItem value="FunctionExpression">Function Expression</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label for="action" class="text-xs">Action</Label>
                        <Select 
                            type="single"
                            bind:value={formData.action}
                            items={[
                                { value: FallbackActionType.SET_DEFAULT, label: 'Set Default' },
                                { value: FallbackActionType.SHOW_MESSAGE, label: 'Show Message' },
                                { value: FallbackActionType.SKIP_FIELD, label: 'Skip Field' },
                                { value: FallbackActionType.RETRY, label: 'Retry' },
                                { value: FallbackActionType.CLEAR_FIELD, label: 'Clear Field' },
                                { value: FallbackActionType.DISABLE_FIELD, label: 'Disable Field' }
                            ]}
                        >
                            <SelectTrigger class="text-sm">
                                <span>{formData.action ? getActionLabel(formData.action) : 'Select action'}</span>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FallbackActionType.SET_DEFAULT}>Set Default</SelectItem>
                                <SelectItem value={FallbackActionType.SHOW_MESSAGE}>Show Message</SelectItem>
                                <SelectItem value={FallbackActionType.SKIP_FIELD}>Skip Field</SelectItem>
                                <SelectItem value={FallbackActionType.RETRY}>Retry</SelectItem>
                                <SelectItem value={FallbackActionType.CLEAR_FIELD}>Clear Field</SelectItem>
                                <SelectItem value={FallbackActionType.DISABLE_FIELD}>Disable Field</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>


                {#if formData.action === FallbackActionType.SHOW_MESSAGE}
                    <div>
                        <Label for="actionMessage" class="text-xs">Message</Label>
                        <Textarea
                            id="actionMessage"
                            bind:value={formData.actionMessage}
                            placeholder="Enter message to show"
                            class="text-sm"
                            rows={2}
                        />
                    </div>
                {/if}

                {#if formData.action === FallbackActionType.RETRY}
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <Label for="maxAttempts" class="text-xs">Max Attempts</Label>
                            <Input
                                id="maxAttempts"
                                type="number"
                                bind:value={formData.maxAttempts}
                                min="1"
                                class="text-sm"
                            />
                        </div>
                        <div>
                            <Label for="delay" class="text-xs">Delay (ms)</Label>
                            <Input
                                id="delay"
                                type="number"
                                bind:value={formData.delay}
                                min="0"
                                class="text-sm"
                            />
                        </div>
                    </div>
                {/if}

                <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                        <Checkbox
                            id="isActive"
                            bind:checked={formData.isActive}
                        />
                        <Label for="isActive" class="text-xs">Active</Label>
                    </div>
                </div>

                <div class="flex justify-end space-x-2">
                    <Button type="button" variant="outline" size="sm" onclick={cancelEdit}>
                        <X class="w-3 h-3 mr-1" />
                        Cancel
                    </Button>
                    <Button type="button" size="sm" onclick={saveRule} disabled={loading}>
                        <Save class="w-3 h-3 mr-1" />
                        {editingRule ? 'Update' : 'Create'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    {/if}

    {#if loading && !showCreateForm}
        <div class="text-center py-2 text-sm text-gray-500">Loading fallback rules...</div>
    {/if}

    {#if fallbackRules.length === 0 && !loading && !showCreateForm}
        <div class="text-center py-4 text-sm text-gray-500">
            <p>No fallback rules defined</p>
            <Button type="button" size="sm" onclick={startCreate} class="mt-2">
                <Plus class="w-3 h-3 mr-1" />
                Create First Rule
            </Button>
        </div>
    {/if}

    {#if fallbackRules.length > 0}
        <div class="space-y-2">
            {#each fallbackRules as rule (rule.id)}
                <div class="flex items-center justify-between p-3 border rounded-lg {selectedFallbackRuleId === rule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h5 class="text-sm font-medium">{rule.Name}</h5>
                            <Badge class="{getActionColor(rule.Action)} text-xs">
                                {getActionLabel(rule.Action)}
                            </Badge>
                            {#if !rule.IsActive}
                                <Badge variant="secondary" class="text-xs">Inactive</Badge>
                            {/if}
                        </div>
                        {#if rule.Description}
                            <p class="text-xs text-gray-600 mb-1">{rule.Description}</p>
                        {/if}
                        <div class="flex items-center gap-3 text-xs text-gray-500">
                            <span>Priority: {rule.Priority}</span>
                            <span>Type: {rule.OperationType || 'Logical'}</span>
                            {#if rule.Action === FallbackActionType.SHOW_MESSAGE && rule.ActionMessage}
                                <span>Message: {rule.ActionMessage}</span>
                            {/if}
                            {#if rule.Action === FallbackActionType.RETRY && rule.ActionParameters}
                                <span>Max: {rule.ActionParameters.maxAttempts}</span>
                                <span>Delay: {rule.ActionParameters.delay}ms</span>
                            {/if}
                        </div>
                    </div>
                    <div class="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={() => selectRule(rule.id)}
                            class={selectedFallbackRuleId === rule.id ? 'bg-blue-100' : ''}
                        >
                            Select
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={() => startEdit(rule)}
                        >
                            <Edit class="w-3 h-3" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={() => deleteRule(rule.id)}
                        >
                            <Trash2 class="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
