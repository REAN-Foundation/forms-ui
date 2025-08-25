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
    ErrorWhenFalse: boolean,
    ErrorMessage: string,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(ErrorWhenFalse !== undefined && ErrorWhenFalse !== null && { ErrorWhenFalse }),
        ...(ErrorMessage !== undefined && ErrorMessage !== null && { ErrorMessage }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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
    ErrorWhenFalse: boolean,
    ErrorMessage: string,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(ErrorWhenFalse !== undefined && ErrorWhenFalse !== null && { ErrorWhenFalse }),
        ...(ErrorMessage !== undefined && ErrorMessage !== null && { ErrorMessage }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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
    SkipWhenTrue: boolean,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(SkipWhenTrue !== undefined && SkipWhenTrue !== null && { SkipWhenTrue }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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
    SkipWhenTrue: boolean,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Priority !== undefined && Priority !== null && { Priority }),
        ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(SkipWhenTrue !== undefined && SkipWhenTrue !== null && { SkipWhenTrue }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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
    ConditionForOperationId: string,
    OperationId: string,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        // ...(Priority !== undefined && Priority !== null && { Priority }),
        // ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(ConditionForOperationId !== undefined && ConditionForOperationId !== null && { ConditionForOperationId }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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
    ConditionForOperationId: string,
    OperationId: string,
    LogicId: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(BaseOperationId !== undefined && BaseOperationId !== null && { BaseOperationId }),
        // ...(Priority !== undefined && Priority !== null && { Priority }),
        // ...(IsActive !== undefined && IsActive !== null && { IsActive }),
        ...(OperationType !== undefined && OperationType !== null && { OperationType }),
        ...(ConditionForOperationId !== undefined && ConditionForOperationId !== null && { ConditionForOperationId }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(LogicId !== undefined && LogicId !== null && { LogicId })
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