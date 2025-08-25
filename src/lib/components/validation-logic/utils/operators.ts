// Operator mapping utilities for validation logic

export function toBackendOperator(op: string): string {
    switch (op) {
        case 'Is Empty':
            // backend should interpret appropriately
            return 'Exists';
        case 'Is Not Empty':
            return 'Exists';
        case 'Greater Than':
            return 'GreaterThan';
        case 'Less Than':
            return 'LessThan';
        case 'Equal To':
            return 'Equal';
        case 'Not Equal To':
            return 'NotEqual';
        case 'Contains':
            return 'Contains';
        case 'Does Not Contain':
            return 'DoesNotContain';
        case 'Greater Than or Equal':
            return 'GreaterThanOrEqual';
        case 'Less Than or Equal':
            return 'LessThanOrEqual';
        default:
            return 'Equal';
    }
}

export function toDisplayOperator(op: string): string {
    switch (op) {
        case 'Equal':
            return 'Equal To';
        case 'NotEqual':
            return 'Not Equal To';
        case 'GreaterThan':
            return 'Greater Than';
        case 'LessThan':
            return 'Less Than';
        case 'GreaterThanOrEqual':
            return 'Greater Than or Equal';
        case 'LessThanOrEqual':
            return 'Less Than or Equal';
        case 'Contains':
            return 'Contains';
        case 'DoesNotContain':
            return 'Does Not Contain';
        case 'Exists':
            // interpret as not empty for UI
            return 'Is Not Empty';
        default:
            return op || 'Equal To';
    }
}


