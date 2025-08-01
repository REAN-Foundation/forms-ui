import { BACKEND_API_URL } from "$env/static/private";
import { delete_, get_, post_, put_ } from "./common";

//////////////////////////////////////////////////////////////////
// VALIDATION LOGIC FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getValidationLogicById = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-validation-logic/${logicId}`;
    return await get_(url);
};

export const createValidationLogic = async (
    FieldId: string,
    Enabled: boolean
) => {
    const body = {
        FieldId: FieldId,
        Enabled: Enabled
    };
    console.log('data from api/service/logic.ts (validation):', body);
    const url = BACKEND_API_URL + `/field-validation-logic`;
    return await post_(url, body);
};

export const getValidationLogic = async (
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
    const url = BACKEND_API_URL + `/field-validation-logic/search${searchString}`;
    return await get_(url);
};

export const updateValidationLogic = async (
    id: string,
    FieldId: string,
    Enabled: boolean
) => {
    const body = {
        FieldId: FieldId ? FieldId : null,
        Enabled: Enabled ? Enabled : null
    };

    const url = BACKEND_API_URL + `/field-validation-logic/${id}`;
    return await put_(url, body);
};

export const deleteValidationLogic = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-validation-logic/${logicId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// SKIP LOGIC FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getSkipLogicById = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-skip-logic/${logicId}`;
    return await get_(url);
};

export const createSkipLogic = async (
    FieldId: string,
    Enabled: boolean,
    DefaultSkip: boolean
) => {
    const body = {
        FieldId: FieldId,
        Enabled: Enabled,
        DefaultSkip: DefaultSkip
    };
    console.log('data from api/service/logic.ts (skip):', body);
    const url = BACKEND_API_URL + `/field-skip-logic`;
    return await post_(url, body);
};

export const getSkipLogic = async (
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
    const url = BACKEND_API_URL + `/field-skip-logic/search${searchString}`;
    return await get_(url);
};

export const updateSkipLogic = async (
    id: string,
    FieldId: string,
    Enabled: boolean,
    DefaultSkip: boolean
) => {
    const body = {
        FieldId: FieldId ? FieldId : null,
        Enabled: Enabled ? Enabled : null,
        DefaultSkip: DefaultSkip ? DefaultSkip : null
    };

    const url = BACKEND_API_URL + `/field-skip-logic/${id}`;
    return await put_(url, body);
};

export const deleteSkipLogic = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-skip-logic/${logicId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// CALCULATION LOGIC FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getCalculationLogicById = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-calculation-logic/${logicId}`;
    return await get_(url);
};

export const createCalculationLogic = async (
    FieldId: string,
    Enabled: boolean,
    FallbackValue: string
) => {
    const body = {
        FieldId: FieldId,
        Enabled: Enabled,
        FallbackValue: FallbackValue
    };
    console.log('data from api/service/logic.ts (calculation):', body);
    const url = BACKEND_API_URL + `/field-calculation-logic`;
    return await post_(url, body);
};

export const getCalculationLogic = async (
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
    const url = BACKEND_API_URL + `/field-calculation-logic/search${searchString}`;
    return await get_(url);
};

export const updateCalculationLogic = async (
    id: string,
    FieldId: string,
    Enabled: boolean,
    FallbackValue: string
) => {
    const body = {
        FieldId: FieldId ? FieldId : null,
        Enabled: Enabled ? Enabled : null,
        FallbackValue: FallbackValue ? FallbackValue : null
    };

    const url = BACKEND_API_URL + `/field-calculation-logic/${id}`;
    return await put_(url, body);
};

export const deleteCalculationLogic = async (
    logicId: string
) => {
    const url = BACKEND_API_URL + `/field-calculation-logic/${logicId}`;
    return await delete_(url);
}; 