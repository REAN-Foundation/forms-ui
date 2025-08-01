import { z } from "zod";
import { zfd } from "zod-form-data";

// Operation Types enum
export enum OperationType {
    Logical = 'Logical',
    Mathematical = 'Mathematical',
    Composition = 'Composition',
    Iterate = 'Iterate',
    FunctionExpression = 'FunctionExpression',
}

export const validationRuleSchema = z.object({
    Name: z
        .string()
        .min(1, { message: "Name is required." })
        .max(100, { message: "Name cannot exceed 100 characters." })
        .optional(),

    Description: z
        .string()
        .max(500, { message: "Description cannot exceed 500 characters." })
        .optional(),

    Priority: z
        .number()
        .int()
        .min(0, { message: "Priority must be a non-negative integer." })
        .optional(),

    IsActive: z
        .boolean()
        .default(true)
        .optional(),

    OperationType: z
        .enum([
            OperationType.Logical,
            OperationType.Mathematical,
            OperationType.Composition,
            OperationType.Iterate,
            OperationType.FunctionExpression,
        ]).describe("OperationType").refine(
            (val) =>
                [
                    OperationType.Logical,
                    OperationType.Mathematical,
                    OperationType.Composition,
                    OperationType.Iterate,
                    OperationType.FunctionExpression,
                ].includes(val),
            { message: "Invalid operation type." }
        ),

    OperationId: z
        .string()
        .uuid({ message: "OperationId must be a valid UUID." }),

    ErrorWhenFalse: z
        .boolean(),

    ErrorMessage: z
        .string()
        .min(1, { message: "ErrorMessage is required." }),

    LogicId: z
        .string()
        .uuid({ message: "LogicId must be a valid UUID." })
        .optional(),
});

export type ValidationRuleSchema = z.infer<typeof validationRuleSchema>; 