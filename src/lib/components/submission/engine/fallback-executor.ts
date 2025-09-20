import { 
    FallbackActionType, 
    type FallbackRule, 
    type FallbackRuleExecutionResult, 
    type FallbackRuleContext 
} from './types/fallback-rule';

export class FallbackRuleExecutor {
    private fallbackRules: Map<string, FallbackRule> = new Map();

    constructor(fallbackRules: FallbackRule[] = []) {
        fallbackRules.forEach(rule => {
            this.fallbackRules.set(rule.id, rule);
        });
    }

    /**
     * Execute fallback rule by ID
     */
    async executeFallbackRule(
        ruleId: string, 
        context: FallbackRuleContext
    ): Promise<FallbackRuleExecutionResult> {
        const rule = this.fallbackRules.get(ruleId);
        if (!rule) {
            return {
                success: false,
                action: FallbackActionType.SHOW_MESSAGE,
                error: `Fallback rule with ID ${ruleId} not found`
            };
        }

        if (!rule.IsActive) {
            return {
                success: false,
                action: FallbackActionType.SHOW_MESSAGE,
                error: `Fallback rule ${ruleId} is not active`
            };
        }

        try {
            return await this.executeAction(rule, context);
        } catch (error) {
            return {
                success: false,
                action: FallbackActionType.SHOW_MESSAGE,
                error: `Error executing fallback rule: ${error.message}`
            };
        }
    }

    /**
     * Execute fallback rules for a specific operation
     */
    async executeFallbackRulesForOperation(
        baseOperationId: string,
        context: FallbackRuleContext
    ): Promise<FallbackRuleExecutionResult[]> {
        const applicableRules = Array.from(this.fallbackRules.values())
            .filter(rule => 
                rule.IsActive && 
                rule.BaseOperationId === baseOperationId
            )
            .sort((a, b) => (a.ExecutionOrder || 0) - (b.ExecutionOrder || 0));

        const results: FallbackRuleExecutionResult[] = [];

        for (const rule of applicableRules) {
            try {
                const result = await this.executeAction(rule, context);
                results.push(result);

                // If rule says to stop on success and it was successful, break
                if (rule.StopOnSuccess && result.success) {
                    break;
                }
            } catch (error) {
                results.push({
                    success: false,
                    action: rule.Action,
                    error: `Error executing fallback rule ${rule.id}: ${error.message}`
                });
            }
        }

        return results;
    }

    /**
     * Execute a specific fallback action
     */
    private async executeAction(
        rule: FallbackRule, 
        context: FallbackRuleContext
    ): Promise<FallbackRuleExecutionResult> {
        const { Action, ActionMessage, ActionParameters } = rule;

        switch (Action) {
            case FallbackActionType.SET_DEFAULT:
                return this.executeSetDefault('', context);

            case FallbackActionType.SHOW_MESSAGE:
                return this.executeShowMessage(ActionMessage || 'An error occurred', context);

            case FallbackActionType.SKIP_FIELD:
                return this.executeSkipField(context);

            case FallbackActionType.RETRY:
                return this.executeRetry(ActionParameters, context);

            case FallbackActionType.CLEAR_FIELD:
                return this.executeClearField(context);

            case FallbackActionType.DISABLE_FIELD:
                return this.executeDisableField(context);

            default:
                return {
                    success: false,
                    action: Action,
                    error: `Unknown fallback action: ${Action}`
                };
        }
    }

    private executeSetDefault(value: string, context: FallbackRuleContext): FallbackRuleExecutionResult {
        return {
            success: true,
            action: FallbackActionType.SET_DEFAULT,
            value: value,
            message: `Field value set to default: ${value}`
        };
    }

    private executeShowMessage(message: string, context: FallbackRuleContext): FallbackRuleExecutionResult {
        return {
            success: true,
            action: FallbackActionType.SHOW_MESSAGE,
            message: message
        };
    }

    private executeSkipField(context: FallbackRuleContext): FallbackRuleExecutionResult {
        return {
            success: true,
            action: FallbackActionType.SKIP_FIELD,
            message: 'Field skipped due to fallback rule'
        };
    }

    private async executeRetry(
        parameters: any, 
        context: FallbackRuleContext
    ): Promise<FallbackRuleExecutionResult> {
        const retryCount = context.retryCount || 0;
        const maxRetries = parameters?.maxAttempts || 3;
        const delay = parameters?.delay || 1000;

        if (retryCount >= maxRetries) {
            return {
                success: false,
                action: FallbackActionType.RETRY,
                error: `Maximum retry attempts (${maxRetries}) exceeded`
            };
        }

        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));

        return {
            success: true,
            action: FallbackActionType.RETRY,
            message: `Retry attempt ${retryCount + 1} of ${maxRetries}`,
            parameters: { ...parameters, retryCount: retryCount + 1 }
        };
    }

    private executeClearField(context: FallbackRuleContext): FallbackRuleExecutionResult {
        return {
            success: true,
            action: FallbackActionType.CLEAR_FIELD,
            message: 'Field cleared due to fallback rule'
        };
    }

    private executeDisableField(context: FallbackRuleContext): FallbackRuleExecutionResult {
        return {
            success: true,
            action: FallbackActionType.DISABLE_FIELD,
            message: 'Field disabled due to fallback rule'
        };
    }

    /**
     * Add or update a fallback rule
     */
    addFallbackRule(rule: FallbackRule): void {
        this.fallbackRules.set(rule.id, rule);
    }

    /**
     * Remove a fallback rule
     */
    removeFallbackRule(ruleId: string): boolean {
        return this.fallbackRules.delete(ruleId);
    }

    /**
     * Get all fallback rules
     */
    getAllFallbackRules(): FallbackRule[] {
        return Array.from(this.fallbackRules.values());
    }

    /**
     * Get fallback rules for a specific operation
     */
    getFallbackRulesForOperation(baseOperationId: string): FallbackRule[] {
        return Array.from(this.fallbackRules.values())
            .filter(rule => rule.BaseOperationId === baseOperationId)
            .sort((a, b) => (a.ExecutionOrder || 0) - (b.ExecutionOrder || 0));
    }
}
