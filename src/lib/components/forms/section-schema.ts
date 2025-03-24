import { z } from "zod";

export const sectionSchema = z.object({
	id: z.string(),
	Title: z
		.string()
		.min(5, { message: "Title must be at least 5 characters long." })
		.max(100, { message: "Title cannot exceed 100 characters." }),
	ParentSectionId: z.string(),
	Description: z
		.string()
		.max(1024, { message: "Description cannot exceed 1024 characters." })
		.nullable()
		.optional(),
	SectionIdentifier: z
		.string()
		.max(512, { message: "Section Identifier cannot exceed 512 characters." })
		.nullable()
		.optional(),
});

export type SectionSchema = typeof sectionSchema;