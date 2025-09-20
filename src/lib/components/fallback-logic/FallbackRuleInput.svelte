<script lang="ts">
    import { Input } from '../ui/input';
    import { Label } from '../ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
    import { Textarea } from '../ui/textarea';
    import { Settings } from 'lucide-svelte';
    import { FallbackActionType, type FallbackActionParameters } from '../submission/engine/types/fallback-rule';

    let {
        action = $bindable(FallbackActionType.SHOW_MESSAGE),
        actionMessage = $bindable(''),
        actionParameters = $bindable({} as FallbackActionParameters)
    } = $props();

    // Validation errors state
    let errors = $state({} as Record<string, string>);

    // Initialize actionParameters with default values if not provided
    if (!actionParameters || Object.keys(actionParameters).length === 0) {
        actionParameters = {
            timeout: 0,
            maxRetries: 0,
            redirectUrl: '',
            customHandler: '',
            fieldValue: '',
            fieldState: '',
            messageType: 'info' as 'info' | 'warning' | 'error' | 'success',
            showDuration: 0,
            validationRules: []
        };
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

    // Validation functions

    function validateField(fieldName: string, value: any): string {
        switch (fieldName) {
            case 'actionMessage':
                return value && value.trim().length > 500 ? 'Message should be less than 500 characters' : '';
            default:
                return '';
        }
    }

    // Validate all fields
    function validateAll(): boolean {
        errors = {};
        let isValid = true;

        // Validate action message if required
        if (action === FallbackActionType.SHOW_MESSAGE || 
            action === FallbackActionType.RETRY || 
            action === FallbackActionType.CLEAR_FIELD || 
            action === FallbackActionType.DISABLE_FIELD || 
            action === FallbackActionType.SKIP_FIELD) {
            const messageError = validateField('actionMessage', actionMessage);
            if (messageError) {
                errors.actionMessage = messageError;
                isValid = false;
            }
        }

        // Validate action parameters (only basic validation for fields that are still shown)
        // Note: Advanced parameters validation removed as they are no longer displayed

        return isValid;
    }

    // Clear validation errors for a specific field
    function clearFieldError(fieldName: string) {
        if (errors[fieldName]) {
            delete errors[fieldName];
            errors = { ...errors };
        }
    }

    // Handle input changes with validation
    function handleInputChange(fieldName: string, value: any) {
        // Update the value
        if (fieldName === 'actionMessage') {
            actionMessage = value;
        } else if (fieldName in actionParameters) {
            actionParameters = { ...actionParameters, [fieldName]: value };
        }

        // Clear previous error and validate
        clearFieldError(fieldName);
        const error = validateField(fieldName, value);
        if (error) {
            errors = { ...errors, [fieldName]: error };
        }
    }

    // Expose validation function to parent
    export { validateAll };
</script>

<div class="space-y-4">
    <div class="flex items-center gap-2">
        <Settings class="w-4 h-4" />
        <h4 class="text-sm font-medium text-gray-700">Fallback Rule</h4>
    </div>

    <div class="space-y-3">
        <div>
            <Label for="action" class="text-xs">Action</Label>
            <Select 
                type="single"
                bind:value={action}
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
                    <span>{action ? getActionLabel(action) : 'Select action'}</span>
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

        {#if action === FallbackActionType.SHOW_MESSAGE || action === FallbackActionType.RETRY || 
           action === FallbackActionType.CLEAR_FIELD || action === FallbackActionType.DISABLE_FIELD || 
           action === FallbackActionType.SKIP_FIELD}
            <div>
                <Label for="actionMessage" class="text-xs">Message</Label>
                <Textarea
                    id="actionMessage"
                    value={actionMessage}
                    oninput={(e) => handleInputChange('actionMessage', (e.target as HTMLTextAreaElement).value)}
                    placeholder="Enter message to show"
                    class="text-sm {errors.actionMessage ? 'border-red-500' : ''}"
                    rows={2}
                />
                {#if errors.actionMessage}
                    <p class="text-xs text-red-500 mt-1">{errors.actionMessage}</p>
                {/if}
            </div>
        {/if}

    </div>
</div>
