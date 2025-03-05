import { z } from "zod";
import { zfd } from "zod-form-data";

export const questionSchema = z.object({
	id: z.string().uuid(),
	parentSectionId: z.string(),
	title: z.string().min(8).max(256),
	description: z.string().optional(),
	responseType: z.string(),
	score: zfd.numeric(z.number().default(0)).optional(),
	correctAnswer: z.string().optional(),
	hint: z.string().optional(),
	questionImageUrl: z.string().optional(),
	rangeMin: zfd.numeric(z.number()).optional(),
	rangeMax: zfd.numeric(z.number()).optional(),
	// options:z.array(z.object({
	// 	Sequence: z.string(),
	// 	Data: z.string(),
	// 	ImageUrl: z.string().optional(),
	// }))
	options: z.array(z.string().optional()).optional()
});

export type QuestionSchema = typeof questionSchema;