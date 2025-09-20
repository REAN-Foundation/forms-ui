<script lang="ts">
    import { Input } from '../ui/input';
    import { Label } from '../ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
    import { Textarea } from '../ui/textarea';
    import { Settings } from 'lucide-svelte';
    import { FallbackActionType } from '../submission/engine/types/fallback-rule';

    let {
        baseOperationId = '',
        selectedFallbackRuleId = $bindable(''),
        onFallbackRuleChange = () => {},
        isEdit = false,
        editingRule = null,
        ruleName = '',
        ruleDescription = '',
        operationType = 'Logical'
    } = $props();

    let error = $state('');

    // Simplified form data - only Action and Message
    let formData = $state({
        action: FallbackActionType.SHOW_MESSAGE,
        actionValue: '',
        actionMessage: ''
    });

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

    // Initialize with editing rule data if provided
    $effect(() => {
        if (editingRule && editingRule.FallbackRuleId) {
            selectedFallbackRuleId = editingRule.FallbackRuleId;
        }
    });

    // Function to create a fallback rule programmatically
    async function createFallbackRule(ruleData: any): Promise<string | null> {
        try {
            const response = await fetch('/api/server/rules/fallback-rule', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(ruleData)
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to create fallback rule');
            }

            if (result.Data?.id) {
                selectedFallbackRuleId = result.Data.id;
                onFallbackRuleChange(result.Data.id);
                return result.Data.id;
            }
            return null;
        } catch (err) {
            console.error('Error creating fallback rule:', err);
            error = err.message;
            return null;
        }
    }

    // Expose the createFallbackRule function
    export { createFallbackRule };
</script>

<div class="space-y-4">
    <div class="flex items-center gap-2">
        <Settings class="w-4 h-4" />
        <h4 class="text-sm font-medium text-gray-700">Fallback Rule</h4>
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
        </div>
    {/if}

    <div class="space-y-3">
        <div>
            <Label for="action" class="text-xs">Action *</Label>
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

        {#if formData.action === FallbackActionType.SET_DEFAULT}
            <div>
                <Label for="actionValue" class="text-xs">Default Value</Label>
                <Input
                    id="actionValue"
                    bind:value={formData.actionValue}
                    placeholder="Enter default value"
                    class="text-sm"
                />
            </div>
        {/if}

        {#if formData.action === FallbackActionType.SHOW_MESSAGE}
            <div>
                <Label for="actionMessage" class="text-xs">Message *</Label>
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
            <div>
                <Label for="actionMessage" class="text-xs">Retry Message *</Label>
                <Textarea
                    id="actionMessage"
                    bind:value={formData.actionMessage}
                    placeholder="Enter retry message"
                    class="text-sm"
                    rows={2}
                />
            </div>
        {/if}

        {#if formData.action === FallbackActionType.CLEAR_FIELD || formData.action === FallbackActionType.DISABLE_FIELD || formData.action === FallbackActionType.SKIP_FIELD}
            <div>
                <Label for="actionMessage" class="text-xs">Message *</Label>
                <Textarea
                    id="actionMessage"
                    bind:value={formData.actionMessage}
                    placeholder="Enter message to show"
                    class="text-sm"
                    rows={2}
                />
            </div>
        {/if}
    </div>
</div>