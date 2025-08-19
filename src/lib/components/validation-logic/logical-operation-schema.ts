import { z } from "zod";
import { zfd } from "zod-form-data";

// Logical Operator Types enum
export enum LogicalOperatorType {
    Equal = 'Equal',
    NotEqual = 'NotEqual',
    GreaterThan = 'GreaterThan',
    GreaterThanOrEqual = 'GreaterThanOrEqual',
    LessThan = 'LessThan',
    LessThanOrEqual = 'LessThanOrEqual',
    In = 'In',
    NotIn = 'NotIn',
    Contains = 'Contains',
    DoesNotContain = 'DoesNotContain',
    Between = 'Between',
    IsTrue = 'IsTrue',
    IsFalse = 'IsFalse',
    Exists = 'Exists',
    HasConsecutiveOccurrences = 'HasConsecutiveOccurrences',
    RangesOverlap = 'RangesOverlap',
    None = 'None',
}

// Operation Types enum
export enum OperationType {
    Logical = 'Logical',
    Mathematical = 'Mathematical',
    Composition = 'Composition',
    Iterate = 'Iterate',
    FunctionExpression = 'FunctionExpression',
}

export const logicalOperationSchema = z.object({
    Name: z
        .string()
        .min(1, { message: "Name is required." })
        .max(100, { message: "Name cannot exceed 100 characters." })
        .optional(),

    Description: z
        .string()
        .max(500, { message: "Description cannot exceed 500 characters." })
        .optional(),

    Type: z
        .enum([OperationType.Logical])
        .default(OperationType.Logical)
        .optional(),

    Operator: z
        .enum([
            LogicalOperatorType.Equal,
            LogicalOperatorType.NotEqual,
            LogicalOperatorType.GreaterThan,
            LogicalOperatorType.GreaterThanOrEqual,
            LogicalOperatorType.LessThan,
            LogicalOperatorType.LessThanOrEqual,
            LogicalOperatorType.In,
            LogicalOperatorType.NotIn,
            LogicalOperatorType.Contains,
            LogicalOperatorType.DoesNotContain,
            LogicalOperatorType.Between,
            LogicalOperatorType.IsTrue,
            LogicalOperatorType.IsFalse,
            LogicalOperatorType.Exists,
            LogicalOperatorType.HasConsecutiveOccurrences,
            LogicalOperatorType.RangesOverlap,
            LogicalOperatorType.None,
        ], { message: "Invalid operator type." }),

    Operands: z
        .string()
        .min(1, { message: "Operands are required." })
        .refine((val) => {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) && parsed.length >= 2;
            } catch {
                return false;
            }
        }, { message: "Operands must be a valid JSON string with at least 2 elements." }),
});

export type LogicalOperationSchema = z.infer<typeof logicalOperationSchema>;