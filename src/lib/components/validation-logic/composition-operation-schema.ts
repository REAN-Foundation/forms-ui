import { z } from 'zod';

// Operation Type Enum
export enum OperationType {
	Logical = 'Logical',
	Mathematical = 'Mathematical',
	Composition = 'Composition',
	Iterate = 'Iterate',
	FunctionExpression = 'FunctionExpression'
}

// Composition Operator Types
export enum CompositionOperatorType {
	And = 'And',
	Or = 'Or',
	Xor = 'Xor',
	None = 'None'
}

// Composition Operation Schema
export const compositionOperationSchema = z.object({
	Name: z.string().optional(),
	Description: z.string().optional(),
	Type: z.literal(OperationType.Composition).optional(),
	Operator: z.enum(Object.values(CompositionOperatorType) as [string, ...string[]]),
	Children: z.string() // JSON string of operation IDs
});

export type CompositionOperation = z.infer<typeof compositionOperationSchema>; 