import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface Question {
	id: string;
	Title?: string | null;
}

interface Section {
	id: string;
	Questions?: Question[];
	Subsections?: Section[];
}

 export function cleanAssessmentTemplate(template: Section[]): Section[] {
	function cleanSection(section: Section): Section | null {
		const filteredQuestions = section.Questions?.filter(q => q.Title && q.Title.trim() !== "") || [];
		const filteredSubsections = section.Subsections
			?.map(cleanSection)
			.filter((sub): sub is Section => sub !== null); 

		if (filteredQuestions.length === 0 && filteredSubsections.length === 0) {
			return null;
		}

		return {
			...section,
			Questions: filteredQuestions.length > 0 ? filteredQuestions : undefined,
			Subsections: filteredSubsections.length > 0 ? filteredSubsections : undefined
		};
	}

	return template
		.map(cleanSection)
		.filter((section): section is Section => section !== null); 
};
