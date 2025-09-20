import { BACKEND_API_URL } from '$env/static/private';
import { delete_, get_, post_, put_ } from "./common";

//////////////////////////////////////////////////////////////////
export const getValidationRuleById = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-validation-rules/${ruleId}`;
    return await get_(url);
};

export const createValidationRule = async (
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    OperationId: string,
    BaseOperationId: string,
    ErrorWhenFalse: boolean,
    ErrorMessage: string,
    LogicId: string,
    FallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(ErrorWhenFalse !== undefined && ErrorWhenFalse !== null && { ErrorWhenFalse }),
        ...(ErrorMessage !== undefined && ErrorMessage !== null && { ErrorMessage }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId })
    };
    console.log('data from api/service/section.ts :', body);
    const url = BACKEND_API_URL + `/field-validation-rules`;
    return await post_(url, body);
};

export const getValidationRule = async (
    searchParams?: any
) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = BACKEND_API_URL + `/field-validation-rules/search${searchString}`;
    return await get_(url);
};

export const updateValidationRule = async (
    id: string,
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    OperationId: string,
    BaseOperationId: string,
    ErrorWhenFalse: boolean,
    ErrorMessage: string,
    LogicId: string,
    FallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(ErrorWhenFalse !== undefined && ErrorWhenFalse !== null && { ErrorWhenFalse }),
        ...(ErrorMessage !== undefined && ErrorMessage !== null && { ErrorMessage }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId })
    };

    const url = BACKEND_API_URL + `/field-validation-rules/${id}`;
    return await put_(url, body);
};


export const deleteValidationRule = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-validation-rules/${ruleId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// SKIP RULE FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getSkipRuleById = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-skip-rules/${ruleId}`;
    return await get_(url);
};

export const createSkipRule = async (
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    OperationId: string,
    BaseOperationId: string,
    SkipWhenTrue: boolean,
    LogicId: string,
    FallbackRuleId?: string,
    ThenFallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(SkipWhenTrue !== undefined && SkipWhenTrue !== null && { SkipWhenTrue }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId }),
        ...(ThenFallbackRuleId !== undefined && ThenFallbackRuleId !== null && { BaseFallbackRuleId: ThenFallbackRuleId })
    };
    console.log('data from api/service/rule.ts (skip):', body);
    const url = BACKEND_API_URL + `/field-skip-rules`;
    return await post_(url, body);
};

export const getSkipRule = async (
    searchParams?: any
) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = BACKEND_API_URL + `/field-skip-rules/search${searchString}`;
    return await get_(url);
};

export const updateSkipRule = async (
    id: string,
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    OperationId: string,
    BaseOperationId: string,
    SkipWhenTrue: boolean,
    LogicId: string,
    FallbackRuleId?: string,
    ThenFallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(SkipWhenTrue !== undefined && SkipWhenTrue !== null && { SkipWhenTrue }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId }),
        ...(ThenFallbackRuleId !== undefined && ThenFallbackRuleId !== null && { BaseFallbackRuleId: ThenFallbackRuleId })
    };

    const url = BACKEND_API_URL + `/field-skip-rules/${id}`;
    return await put_(url, body);
};

export const deleteSkipRule = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-skip-rules/${ruleId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// CALCULATION RULE FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getCalculationRuleById = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-calculation-rules/${ruleId}`;
    return await get_(url);
};

export const createCalculationRule = async (
    Name: string,
    Description: string,
    BaseOperationId: string,
    // Priority: number,
    // IsActive: boolean,
    OperationType: string,
    // ConditionForOperationId: string,
    OperationId: string,
    LogicId: string,
    Settings?: any,
    RuleOutcome?: any,
    FallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        // ...(Priority !== undefined && Priority !== null && { Priority }),
        // ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        // ...(ConditionForOperationId !== undefined && ConditionForOperationId !== null && { ConditionForOperationId }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(Settings !== undefined && Settings !== null && { Settings }),
        ...(RuleOutcome !== undefined && RuleOutcome !== null && { RuleOutcome }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId })
    };
    console.log('data from api/service/rule.ts (calculation):', body);
    const url = BACKEND_API_URL + `/field-calculation-rules`;
    return await post_(url, body);
};

export const getCalculationRule = async (
    searchParams?: any
) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = BACKEND_API_URL + `/field-calculation-rules/search${searchString}`;
    return await get_(url);
};

export const updateCalculationRule = async (
    id: string,
    Name: string,
    Description: string,
    BaseOperationId: string,
    // Priority: number,
    // IsActive: boolean,
    OperationType: string,
    // ConditionForOperationId: string,
    OperationId: string,
    LogicId: string,
    Settings?: any,
    RuleOutcome?: any,
    FallbackRuleId?: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        // ...(Priority !== undefined && Priority !== null && { Priority }),
        // ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        // ...(ConditionForOperationId !== undefined && ConditionForOperationId !== null && { ConditionForOperationId }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId }),
        ...(Settings !== undefined && Settings !== null && { Settings }),
        ...(RuleOutcome !== undefined && RuleOutcome !== null && { RuleOutcome }),
        ...(FallbackRuleId !== undefined && FallbackRuleId !== null && { FallbackRuleId })
    };

    const url = BACKEND_API_URL + `/field-calculation-rules/${id}`;
    return await put_(url, body);
};

export const deleteCalculationRule = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-calculation-rules/${ruleId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// FALLBACK RULE FUNCTIONS
//////////////////////////////////////////////////////////////////

// Helper function to filter out empty ActionParameters
const filterEmptyActionParameters = (actionParameters: any): any => {
    if (!actionParameters || typeof actionParameters !== 'object') {
        return actionParameters;
    }

    const filtered: any = {};
    Object.keys(actionParameters).forEach(key => {
        const value = actionParameters[key];
        // Only include non-empty values
        if (value !== null && value !== undefined && value !== '' && value !== 0) {
            // For strings, also check if they're not just whitespace
            if (typeof value === 'string' && value.trim() !== '') {
                filtered[key] = value;
            } else if (typeof value !== 'string') {
                filtered[key] = value;
            }
        }
    });

    return filtered;
};
export const getFallbackRuleById = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-fallback-rules/${ruleId}`;
    return await get_(url);
};

export const createFallbackRule = async (
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    BaseOperationId: string,
    Action: string,
    ActionValue: string,
    ActionMessage: string,
    ActionParameters: any,
    ExecutionOrder: number,
    StopOnSuccess: boolean
) => {
    // Filter out empty ActionParameters
    const filteredActionParameters = filterEmptyActionParameters(ActionParameters);

    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(Action !== undefined && Action !== null && { Action }),
        ...(ActionValue !== undefined && ActionValue !== null && { ActionValue }),
        ...(ActionMessage !== undefined && ActionMessage !== null && { ActionMessage }),
        ...(filteredActionParameters !== undefined && filteredActionParameters !== null && Object.keys(filteredActionParameters).length > 0 && { ActionParameters: filteredActionParameters }),
        ...(ExecutionOrder !== undefined && ExecutionOrder !== null && { ExecutionOrder }),
        ...(StopOnSuccess !== undefined && StopOnSuccess !== null && { StopOnSuccess })
    };
    console.log('data from api/service/rule.ts (fallback):', body);
    const url = BACKEND_API_URL + `/field-fallback-rules`;
    return await post_(url, body);
};

export const getFallbackRule = async (
    searchParams?: any
) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
    }
    const url = BACKEND_API_URL + `/field-fallback-rules/search${searchString}`;
    return await get_(url);
};

export const updateFallbackRule = async (
    id: string,
    Name: string,
    Description: string,
    Priority: number,
    IsActive: boolean,
    OperationType: string,
    BaseOperationId: string,
    Action: string,
    ActionValue: string,
    ActionMessage: string,
    ActionParameters: any,
    ExecutionOrder: number,
    StopOnSuccess: boolean
) => {
    // Filter out empty ActionParameters
    const filteredActionParameters = filterEmptyActionParameters(ActionParameters);

    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        ...(Action !== undefined && Action !== null && { Action }),
        ...(ActionValue !== undefined && ActionValue !== null && { ActionValue }),
        ...(ActionMessage !== undefined && ActionMessage !== null && { ActionMessage }),
        ...(filteredActionParameters !== undefined && filteredActionParameters !== null && Object.keys(filteredActionParameters).length > 0 && { ActionParameters: filteredActionParameters }),
        ...(ExecutionOrder !== undefined && ExecutionOrder !== null && { ExecutionOrder }),
        ...(StopOnSuccess !== undefined && StopOnSuccess !== null && { StopOnSuccess })
    };

    const url = BACKEND_API_URL + `/field-fallback-rules/${id}`;
    return await put_(url, body);
};

export const deleteFallbackRule = async (
    ruleId: string
) => {
    const url = BACKEND_API_URL + `/field-fallback-rules/${ruleId}`;
    return await delete_(url);
};