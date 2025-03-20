// import { z } from "zod";
// import { zfd } from "zod-form-data";

// export const questionSchema = z.object({
// 	id: z.string().uuid(),
// 	parentSectionId: z.string().nullable().optional(),
// 	title: z.string().min(18, "Title must be at least 18 characters").max(256),
// 	description: z.string().nullable().optional(),
// 	responseType: z.string(),
// 	score: zfd.numeric(z.number().default(0)).nullable().optional(),
// 	correctAnswer: z.string().nullable().optional(),
// 	hint: z.string().nullable().optional(),
// 	questionImageUrl: z.string().nullable().optional(),
// 	// rangeMin: zfd.numeric(z.number()).optional(),
// 	// rangeMax: zfd.numeric(z.number()).optional(),
// 	// options:z.array(z.object({
// 	// 	Sequence: z.string(),
// 	// 	Data: z.string(),
// 	// 	ImageUrl: z.string().optional(),
// 	// }))
// 	// options: z.array(z.string().optional()).optional()
// });

// export type QuestionSchema = typeof questionSchema;


import { z } from "zod";
import { zfd } from "zod-form-data";

export const questionSchema = z.object({
    Title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters long." })
        .max(100, { message: "Title cannot exceed 100 characters." }),

    Description: z
        .string()
        .max(1024, { message: "Description cannot exceed 1024 characters." })
        .nullable()
        .optional(),

    Score: zfd
        .numeric(z.number().min(0, { message: "Score cannot be negative." }).default(0))
        .nullable()
        .optional(),

    CorrectAnswer: z
        .string()
        .max(512, { message: "Correct answer cannot exceed 512 characters." })
        .nullable()
        .optional(),

    Hint: z
        .string()
        .max(512, { message: "Hint cannot exceed 512 characters." })
        .nullable()
        .optional(),

    QuestionImageUrl: z
        .string()
        .url({ message: "Invalid URL format for the image." })
        .nullable()
        .optional(),

    RangeMin: zfd
        .numeric(z.number().min(0, { message: "Minimum range must be at least 0." }))
        .optional(),

    RangeMax: zfd
        .numeric(z.number().min(0, { message: "Maximum range must be at least 0." }))
        .optional(),

    options: z
        .array(
            z.object({
                Sequence: z
                    .string()
                    .min(1, { message: "Sequence cannot be empty." })
                    .max(10, { message: "Sequence cannot exceed 10 characters." }),

                Data: z
                    .string()
                    .min(1, { message: "Option data cannot be empty." })
                    .max(256, { message: "Option data cannot exceed 256 characters." }),

                ImageUrl: z
                    .string()
                    .url({ message: "Invalid URL format for the option image." })
                    .optional(),
            })
        )
        .min(2, { message: "At least two options are required." })
        .max(10, { message: "A maximum of 10 options are allowed." })
        .optional(),

    isRequired: z.boolean().default(false)
});

export type QuestionSchema = typeof questionSchema;
