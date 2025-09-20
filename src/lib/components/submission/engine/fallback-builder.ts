import { 
    FallbackActionType, 
    type FallbackRule, 
    type FallbackRuleCreateModel,
    type FallbackActionParameters 
} from './types/fallback-rule';

export class FallbackRuleBuilder {
    private id: string;
    private name: string;
    private description?: string;
    private priority: number = 1;
    private isActive: boolean = true;
    private baseOperationId?: string;
    private action: FallbackActionType;
    private actionValue?: string;
    private actionMessage?: string;
    private actionParameters?: FallbackActionParameters;
    private executionOrder: number = 1;
    private stopOnSuccess: boolean = true;

    constructor(id: string, name: string, action: FallbackActionType) {
        this.id = id;
        this.name = name;
        this.action = action;
    }

    static create(id: string, name: string, action: FallbackActionType): FallbackRuleBuilder {
        return new FallbackRuleBuilder(id, name, action);
    }

    setDescription(description: string): FallbackRuleBuilder {
        this.description = description;
        return this;
    }

    setPriority(priority: number): FallbackRuleBuilder {
        this.priority = priority;
        return this;
    }

    setActive(isActive: boolean): FallbackRuleBuilder {
        this.isActive = isActive;
        return this;
    }

    setBaseOperationId(baseOperationId: string): FallbackRuleBuilder {
        this.baseOperationId = baseOperationId;
        return this;
    }


    setActionMessage(actionMessage: string): FallbackRuleBuilder {
        this.actionMessage = actionMessage;
        return this;
    }

    setActionParameters(parameters: FallbackActionParameters): FallbackRuleBuilder {
        this.actionParameters = parameters;
        return this;
    }


    build(): FallbackRule {
        return {
            id: this.id,
            Name: this.name,
            Description: this.description,
            Priority: this.priority,
            IsActive: this.isActive,
            BaseOperationId: this.baseOperationId,
            Action: this.action,
            ActionMessage: this.actionMessage,
            ActionParameters: this.actionParameters,
        };
    }

    buildCreateModel(): FallbackRuleCreateModel {
        return {
            Name: this.name,
            Description: this.description,
            Priority: this.priority,
            IsActive: this.isActive,
            BaseOperationId: this.baseOperationId,
            Action: this.action,
            ActionMessage: this.actionMessage,
            ActionParameters: this.actionParameters,
        };
    }
}

// Predefined fallback rule builders for common scenarios
export class CommonFallbackRules {
    static createSetDefaultRule(
        id: string, 
        name: string, 
        defaultValue: string, 
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.SET_DEFAULT)
            .setBaseOperationId(baseOperationId || '')
            .setDescription(`Set default value`)
            .build();
    }

    static createShowMessageRule(
        id: string, 
        name: string, 
        message: string, 
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.SHOW_MESSAGE)
            .setActionMessage(message)
            .setBaseOperationId(baseOperationId || '')
            .setDescription(`Show message: ${message}`)
            .build();
    }

    static createSkipFieldRule(
        id: string, 
        name: string, 
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.SKIP_FIELD)
            .setBaseOperationId(baseOperationId || '')
            .setDescription('Skip field on error')
            .build();
    }

    static createRetryRule(
        id: string, 
        name: string, 
        maxAttempts: number = 3, 
        delay: number = 1000,
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.RETRY)
            .setBaseOperationId(baseOperationId || '')
            .setActionParameters({
                maxAttempts,
                delay,
                retryCount: 0
            })
            .setDescription(`Retry up to ${maxAttempts} times with ${delay}ms delay`)
            .build();
    }

    static createClearFieldRule(
        id: string, 
        name: string, 
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.CLEAR_FIELD)
            .setBaseOperationId(baseOperationId || '')
            .setDescription('Clear field value on error')
            .build();
    }

    static createDisableFieldRule(
        id: string, 
        name: string, 
        baseOperationId?: string
    ): FallbackRule {
        return FallbackRuleBuilder
            .create(id, name, FallbackActionType.DISABLE_FIELD)
            .setBaseOperationId(baseOperationId || '')
            .setDescription('Disable field on error')
            .build();
    }
}
