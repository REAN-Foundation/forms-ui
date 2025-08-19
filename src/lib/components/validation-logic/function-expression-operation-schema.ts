import { z } from 'zod';

// Operation Type Enum
export enum OperationType {
	Logical = 'Logical',
	Mathematical = 'Mathematical',
	Composition = 'Composition',
	Iterate = 'Iterate',
	FunctionExpression = 'FunctionExpression'
}

// Function Expression Operation Schema
export const functionExpressionOperationSchema = z.object({
	Name: z.string().optional(),
	Description: z.string().optional(),
	Type: z.literal(OperationType.FunctionExpression).optional(),
	Expression: z.string(),
	Variables: z.string()
});

export type FunctionExpressionOperation = z.infer<typeof functionExpressionOperationSchema>;