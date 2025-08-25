import { BACKEND_API_URL } from "$env/static/private";
import { delete_, get_, post_, put_ } from "./common";

//////////////////////////////////////////////////////////////////
// FUNCTION EXPRESSION OPERATION FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getFunctionExpressionOperationById = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-function-expression-operations/${operationId}`;
    return await get_(url);
};

export const createFunctionExpressionOperation = async (
    Name: string,
    Description: string,
    Expression: string,
    Variables: any
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Expression !== undefined && Expression !== null && { Expression }),
        ...(Variables !== undefined && Variables !== null && { Variables })
    };
    console.log('data from api/service/operations.ts (function-expression):', body);
    const url = BACKEND_API_URL + `/field-function-expression-operations`;
    return await post_(url, body);
};

export const getFunctionExpressionOperation = async (
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
    const url = BACKEND_API_URL + `/field-function-expression-operations/search${searchString}`;
    return await get_(url);
};

export const updateFunctionExpressionOperation = async (
    id: string,
    Name: string,
    Description: string,
    Expression: string,
    Variables: any
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Expression !== undefined && Expression !== null && { Expression }),
        ...(Variables !== undefined && Variables !== null && { Variables })
    };

    const url = BACKEND_API_URL + `/field-function-expression-operations/${id}`;
    return await put_(url, body);
};

export const deleteFunctionExpressionOperation = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-function-expression-operations/${operationId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// COMPOSITION OPERATION FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getCompositionOperationById = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-composition-operations/${operationId}`;
    return await get_(url);
};

export const createCompositionOperation = async (
    Name: string,
    Description: string,
    Operator: string,
    Children: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Children !== undefined && Children !== null && { Children })
    };
    console.log('data from api/service/operations.ts (composition):', body);
    const url = BACKEND_API_URL + `/field-composition-operations`;
    return await post_(url, body);
};

export const getCompositionOperation = async (
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
    const url = BACKEND_API_URL + `/field-composition-operations/search${searchString}`;
    return await get_(url);
};

export const updateCompositionOperation = async (
    id: string,
    Name: string,
    Description: string,
    Operator: string,
    Children: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Children !== undefined && Children !== null && { Children })
    };

    const url = BACKEND_API_URL + `/field-composition-operations/${id}`;
    return await put_(url, body);
};

export const deleteCompositionOperation = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-composition-operations/${operationId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// MATHEMATICAL OPERATION FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getMathematicalOperationById = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-mathematical-operations/${operationId}`;
    return await get_(url);
};

export const createMathematicalOperation = async (
    Name: string,
    Description: string,
    Operator: string,
    Operands: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Operands !== undefined && Operands !== null && { Operands })
    };
    console.log('data from api/service/operations.ts (mathematical):', body);
    const url = BACKEND_API_URL + `/field-mathematical-operations`;
    return await post_(url, body);
};

export const getMathematicalOperation = async (
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
    const url = BACKEND_API_URL + `/field-mathematical-operations/search${searchString}`;
    return await get_(url);
};

export const updateMathematicalOperation = async (
    id: string,
    Name: string,
    Description: string,
    Operator: string,
    Operands: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Operands !== undefined && Operands !== null && { Operands })
    };

    const url = BACKEND_API_URL + `/field-mathematical-operations/${id}`;
    return await put_(url, body);
};

export const deleteMathematicalOperation = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-mathematical-operations/${operationId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// ITERATE OPERATION FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getIterateOperationById = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-iterate-operations/${operationId}`;
    return await get_(url);
};

export const createIterateOperation = async (
    Name: string,
    Description: string,
    ItemAlias: string,
    OperationId: string,
    ArrayOperand: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(ItemAlias !== undefined && ItemAlias !== null && { ItemAlias }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(ArrayOperand !== undefined && ArrayOperand !== null && { ArrayOperand })
    };
    console.log('data from api/service/operations.ts (iterate):', body);
    const url = BACKEND_API_URL + `/field-iterate-operations`;
    return await post_(url, body);
};

export const getIterateOperation = async (
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
    const url = BACKEND_API_URL + `/field-iterate-operations/search${searchString}`;
    return await get_(url);
};

export const updateIterateOperation = async (
    id: string,
    Name: string,
    Description: string,
    ItemAlias: string,
    OperationId: string,
    ArrayOperand: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(ItemAlias !== undefined && ItemAlias !== null && { ItemAlias }),
        ...(OperationId !== undefined && OperationId !== null && { OperationId }),
        ...(ArrayOperand !== undefined && ArrayOperand !== null && { ArrayOperand })
    };

    const url = BACKEND_API_URL + `/field-iterate-operations/${id}`;
    return await put_(url, body);
};

export const deleteIterateOperation = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-iterate-operations/${operationId}`;
    return await delete_(url);
};

//////////////////////////////////////////////////////////////////
// LOGICAL OPERATION FUNCTIONS
//////////////////////////////////////////////////////////////////
export const getLogicalOperationById = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-logical-operations/${operationId}`;
    return await get_(url);
};

export const createLogicalOperation = async (
    Name: string,
    Description: string,
    Operator: string,
    Operands: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Operands !== undefined && Operands !== null && { Operands })
    };
    console.log('data from api/service/operations.ts (logical):', body);
    const url = BACKEND_API_URL + `/field-logical-operations`;
    return await post_(url, body);
};

export const getLogicalOperation = async (
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
    const url = BACKEND_API_URL + `/field-logical-operations/search${searchString}`;
    return await get_(url);
};

export const updateLogicalOperation = async (
    id: string,
    Name: string,
    Description: string,
    Operator: string,
    Operands: string
) => {
    const body = {
        ...(Name !== undefined && Name !== null && { Name }),
        ...(Description !== undefined && Description !== null && { Description }),
        ...(Operator !== undefined && Operator !== null && { Operator }),
        ...(Operands !== undefined && Operands !== null && { Operands })
    };

    const url = BACKEND_API_URL + `/field-logical-operations/${id}`;
    return await put_(url, body);
};

export const deleteLogicalOperation = async (
    operationId: string
) => {
    const url = BACKEND_API_URL + `/field-logical-operations/${operationId}`;
    return await delete_(url);
};