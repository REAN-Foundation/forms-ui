export enum OperationType {
    Logical = 'Logical',
    Mathematical = 'Mathematical',
    Composition = 'Composition',
    Iterate = 'Iterate',
    FunctionExpression = 'FunctionExpression',
}

export enum FallbackActionType {
    SET_DEFAULT = 'SET_DEFAULT',
    SHOW_MESSAGE = 'SHOW_MESSAGE',
    SKIP_FIELD = 'SKIP_FIELD',
    RETRY = 'RETRY',
    CLEAR_FIELD = 'CLEAR_FIELD',
    DISABLE_FIELD = 'DISABLE_FIELD',
}

export interface FallbackActionParameters {
    timeout?: number;
    maxRetries?: number;
    redirectUrl?: string;
    customHandler?: string;
    fieldValue?: any;
    fieldState?: string;
    messageType?: 'info' | 'warning' | 'error' | 'success';
    showDuration?: number;
    validationRules?: any[];
    retryCount?: number;
    delay?: number;
    maxAttempts?: number;
    customSettings?: Record<string, any>;
}

export interface BaseRuleCreateModel {
    Name: string;
    Description?: string;
    Priority?: number;
    IsActive?: boolean;
}

export interface FallbackRuleCreateModel extends BaseRuleCreateModel {
    BaseOperationId?: string;
    OperationType?: OperationType;
    Priority?: number;
    IsActive?: boolean;
    Action: FallbackActionType;
    ActionMessage?: string;
    ActionParameters?: FallbackActionParameters;
}

export interface FallbackRule extends FallbackRuleCreateModel {
    id: string;
    CreatedAt?: string;
    UpdatedAt?: string;
}

export interface FallbackRuleUpdateModel extends Partial<FallbackRuleCreateModel> {
    id: string;
}

export interface FallbackRuleExecutionResult {
    success: boolean;
    action: FallbackActionType;
    message?: string;
    value?: any;
    parameters?: FallbackActionParameters;
    error?: string;
}

export interface FallbackRuleContext {
    fieldId: string;
    currentValue: any;
    formData: Record<string, any>;
    error?: Error;
    retryCount?: number;
    maxRetries?: number;
}
