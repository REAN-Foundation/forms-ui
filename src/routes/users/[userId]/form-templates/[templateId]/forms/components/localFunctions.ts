export type Card = {
    localId: number;
    id: string;
    name: string;
    type: string;
    value: string;
    icon: string;
    sectionId: string;
    Description: string,
    Options: [];
    tempId:string;
};

export type Section = {
    id: string;
    SectionIdentifier: string | null;
    Title: string | null;
    Description: string | null;
    DisplayCode: string;
    Sequence: string | null;
    ParentSectionId: string;
    CreatedAt: string;
    UpdatedAt: string | null;
    localId: number;
    title: string;
    databaseId: string;
    name: string;
    type: string;
    cards: Card[];
    subsections: Section[];
    subsectionCount: number;
    ParentFormTemplateId: string;
};

// export type SubSection = {
//     id: string;
//     SectionIdentifier: string | null;
//     Title: string | null;
//     Description: string | null;
//     DisplayCode: string;
//     Sequence: string | null;
//     ParentSectionId: string;
//     CreatedAt: string;
//     UpdatedAt: string | null;
//     localId: number;
//     title: string;
//     databaseId: string;
//     name: string;
//     type: string;
//     cards: Card[];
//     ParentFormTemplateId: string;
// };

export type newSectionTemplate = {
    id: string
    localId: number,
    name: string,
    type: 'section',
    cards: Card[],
    subsections: [],
    subsectionCount: 0
};

export function findSectionById(
    sections: Section[],
    sectionId: number,
    parentSectionId: string = null
): Section | null {
    const selectedSction = sections.filter((section) => section.localId == sectionId);
    return selectedSction.length > 0 ? selectedSction[0] : null;
    // for (const section of sections) {
    //     // Check if the current section matches the ID and optional parent ID
    //     // if (section.localId == sectionId && (parentSectionId === null || section.ParentSectionId === parentSectionId)) {
    //         if (section.localId == sectionId) {
    //         console.log("Found section:", section);
    //         return section;
    //     }
    //     if (section.subsections) {
    //         for (const subsection of section.subsections) {
    //             // Check if the subsection matches the ID and parent ID
    //             if (subsection.localId == sectionId) {
    //                 console.log("Found subsection:", subsection);
    //                 return subsection;
    //             }
    //         }
    //     }
    // }
    // return null;
}

export function updateSectionWithSubsection(
    sections: Section[],
    sectionId: number,
    subsection: Section
): Section[] {
    // Iterate through each section in the array.
    return sections.map((section) => {
        if (section.localId === sectionId) {
            // Add the subsection to the matched section.
            return {
                ...section,
                subsections: [...section.subsections, subsection]
            };
        }
        
        // Recursively call the function if subsections exist.
        if (section.subsections.length > 0) {
            return {
                ...section,
                subsections: updateSectionWithSubsection(
                    section.subsections,
                    sectionId,
                    subsection
                )
            };
        }
        return section;
    });
}

export function deleteSectionById(sections: Section[], sectionId: number, isSubsection = false): Section[] {
    return sections.filter((section) => {
        if (isSubsection) {
            // If deleting a subsection, filter it out from the section's subsections
            section.subsections = section.subsections.filter((subsection) => subsection.localId !== sectionId);
        } else if (section.localId === sectionId) {
            // If deleting a main section, remove it completely
            return false;
        }

        // Recursively check subsections if not a direct match
        section.subsections = deleteSectionById(section.subsections, sectionId, true);
        return true;
    });
}


export const findSectionByTitle = (sections: Section[], title: string): Section | undefined => {
    return sections.find(section => section.Title === title);
};

// export function mapSectionsAndQuestions(
//     sections: any[],
//     uiSections: Section[],
//     rootSectionId: string,
//     questions: any[]
// ) {
//     if (!sections || !Array.isArray(sections)) {
//         console.error('mapSections: sections is undefined or not an array', sections);
//         return;
//     }

//     let cardLocalIdCounter = 1; // Initialize the counter for card localIds

//     // 1) Exclude the root section
//     const nonRootSections = sections.filter((section) => section.ParentSectionId !== rootSectionId);

//     // 2) Separate out parent sections (sections with ParentSectionId as rootSectionId)
//     const parentSections = sections.filter((section) => section.ParentSectionId === rootSectionId);

//     // 3) Separate the remaining sections as subsections
//     const subsections = nonRootSections.filter(
//         (section) => section.ParentSectionId !== rootSectionId
//     );

//     // 4) Map subsections to their corresponding parent sections
//     const mappedParentSections = parentSections.map((parentSection, index) => {
//         // Assign subsections to the parent section
//         const childSubsections = subsections.filter(
//             (subsection) => subsection.ParentSectionId === parentSection.id
//         );

//         let sectionNameCounter = 1;
//         let sectionIdCounter = 1;

//         // Map each child subsection to the parent section
//         const mappedSubsections = childSubsections.map((subsection) => {
//             // Assign questions to subsections
//             const subsectionQuestions = questions.filter(
//                 (question) => question.ParentFormSection.id === subsection.id
//             );

//             // Create card objects for questions with localIds
//             const mappedCards = subsectionQuestions.map((question) => ({
//                 id: question.id,
//                 name: question.ResponseType,
//                 type: question.ResponseType,
//                 Title: question.Title,
//                 Description: question.Description,
//                 Options: question.Options,
//                 value: null, // You can define how to handle this based on your requirements
//                 icon: null, // Set this based on your needs
//                 localId: cardLocalIdCounter++ // Assign and increment localId
//             }));

//             return {
//                 ...subsection,
//                 cards: mappedCards,
//                 subsections: [], // Further subsections can be handled similarly
//                 subsectionCount: 0,
//                 name: `SubSection ${sectionNameCounter++}`,
//                 localId: sectionIdCounter++
//             };
//         });

//         // Assign questions to parent sections
//         const parentSectionQuestions = questions.filter(
//             (question) => question.ParentFormSection.id === parentSection.id
//         );

//         // Create card objects for questions with localIds
//         const parentSectionCards = parentSectionQuestions.map((question) => ({
//             id: question.id,
//             name: question.ResponseType,
//             type: question.ResponseType,
//             Title: question.Title,
//             Description: question.Description,
//             Options: question.Options,
//             value: null, // You can define how to handle this based on your requirements
//             icon: null, // Set this based on your needs
//             localId: cardLocalIdCounter++ // Assign and increment localId
//         }));

//         return {
//             ...parentSection,
//             localId: index + 1,
//             title: `Section ${index + 1}`,
//             databaseId: parentSection.id,
//             id: (index + 1).toString(),
//             name: `Section ${index + 1}`,
//             type: 'section',
//             cards: parentSectionCards,
//             subsections: mappedSubsections,
//             subsectionCount: mappedSubsections.length,
//             SectionIdentifier: parentSection.SectionIdentifier,
//             Title: parentSection.Title,
//             Description: parentSection.Description,
//             DisplayCode: parentSection.DisplayCode,
//             Sequence: parentSection.Sequence,
//             ParentSectionId: parentSection.ParentSectionId,
//             ParentFormTemplateId: parentSection.ParentFormTemplate.id,
//             CreatedAt: parentSection.CreatedAt,
//             UpdatedAt: parentSection.UpdatedAt
//         };
//     });

//     uiSections.push(...mappedParentSections);
//     return uiSections;
// }

export function mapSectionsAndQuestions(
    sections: any[],
    uiSections: Section[],
    rootSectionId: string,
    questions: any[]
) {
    if (!sections || !Array.isArray(sections)) {
        console.error('mapSections: sections is undefined or not an array', sections);
        return;
    }

    let cardLocalIdCounter = 1;

    // 1) Exclude the root section
    const nonRootSections = sections.filter((section) => section.ParentSectionId !== rootSectionId);

    // 2) Separate out parent sections (sections with ParentSectionId as rootSectionId)
    const parentSections = sections.filter((section) => section.ParentSectionId === rootSectionId);

    // 3) Separate the remaining sections as subsections
    const subsections = nonRootSections.filter(
        (section) => section.ParentSectionId !== rootSectionId
    );

    // 4) Sort parent sections by Sequence
    parentSections.sort((a, b) => a.Sequence.localeCompare(b.Sequence));

    // 5) Map subsections to their corresponding parent sections
    const mappedParentSections = parentSections.map((parentSection, index) => {
        // Assign subsections to the parent section and sort them by Sequence
        const childSubsections = subsections
            .filter((subsection) => subsection.ParentSectionId === parentSection.id)
            .sort((a, b) => a.Sequence.localeCompare(b.Sequence));

        let sectionNameCounter = 1;
        let         sectionIdCounter = 1;

        // Map each child subsection to the parent section
        const mappedSubsections = childSubsections.map((subsection) => {
            // Assign questions to subsections and sort them by Sequence
            const subsectionQuestions = questions
                .filter((question) => question.ParentFormSection.id === subsection.id)
                .sort((a, b) => a.Sequence.localeCompare(b.Sequence));

            // Create card objects for questions with localIds
            const mappedCards = subsectionQuestions.map((question) => ({
                id: question.id,
                name: question.ResponseType,
                type: question.ResponseType,
                Title: question.Title,
                Description: question.Description,
                Options: question.Options,
                value: null,
                icon: null,
                localId: cardLocalIdCounter++
            }));

            return {
                ...subsection,
                cards: mappedCards,
                subsections: [],
                subsectionCount: 0,
                name: `SubSection ${sectionNameCounter++}`,
                localId: sectionIdCounter++
            };
        });

        // Assign questions to parent sections and sort them by Sequence
        const parentSectionQuestions = questions
            .filter((question) => question.ParentFormSection.id === parentSection.id)
            .sort((a, b) => a.Sequence.localeCompare(b.Sequence));

        // Create card objects for questions with localIds
        const parentSectionCards = parentSectionQuestions.map((question) => ({
            id: question.id,
            name: question.ResponseType,
            type: question.ResponseType,
            Title: question.Title,
            Description: question.Description,
            Options: question.Options,
            value: null,
            icon: null,
            localId: cardLocalIdCounter++
        }));

        return {
            ...parentSection,
            localId: index + 1,
            title: `Section ${index + 1}`,
            databaseId: parentSection.id,
            id: (index + 1).toString(),
            name: `Section ${index + 1}`,
            type: 'section',
            cards: parentSectionCards,
            subsections: mappedSubsections,
            subsectionCount: mappedSubsections.length,
            SectionIdentifier: parentSection.SectionIdentifier,
            Title: parentSection.Title,
            Description: parentSection.Description,
            DisplayCode: parentSection.DisplayCode,
            Sequence: parentSection.Sequence,
            ParentSectionId: parentSection.ParentSectionId,
            ParentFormTemplateId: parentSection.ParentFormTemplate.id,
            CreatedAt: parentSection.CreatedAt,
            UpdatedAt: parentSection.UpdatedAt
        };
    });

    // Append the sorted and mapped sections to uiSections
    uiSections.push(...mappedParentSections);
    return uiSections;
}

// async function handleDragAndDrop(
// 	dropData,
// 	event: { preventDefault: () => void; stopPropagation: () => void },
// 	sectionId: number = null,
// 	subsectionId: number = null
// ) {
// 	event.preventDefault();
// 	event.stopPropagation();

// 	console.log(dropData, 'this is drop data');
// 	let dropSectionData;

// 	if (dropData.type === 'section') {
// 		if (sectionId === null) {
// 			// Handling main section addition
// 			dropSectionData = await getSectionData(parentFormTemplateId, rootSectionId);
// 			console.log(dropSectionData, 'this is drop section data');
// 			const newSection = {
// 				...dropData,
// 				databaseId: dropSectionData.id,
// 				localId: nextSectionId++,
// 				name: `Section ${sectionNameCounter++}`,
// 				cards: [],
// 				subsections: [],
// 				subsectionCount: 0,
// 				Title: dropSectionData.Title,
// 				Description: dropSectionData.Description,
// 				Sequence: dropSectionData.Sequence,
// 				ParentSectionId: dropSectionData.ParentSectionId,
// 				ParentFormTemplateId: dropSectionData.ParentFormTemplate.id
// 			};
// 			console.log(newSection, 'this is new section');
// 			uiSections = [...uiSections, newSection]; // Explicit reassignment
// 			console.log(uiSections, 'this is uiSections');
// 			toast.success('Section added successfully! Please add section details.');
// 		} else {
// 			// Handling subsection addition
// 			const parentSection = findSectionById(uiSections, sectionId);
// 			if (parentSection) {
// 				const newSubsectionId = await getSectionData(
// 					parentFormTemplateId,
// 					parentSection.databaseId
// 				);
// 				const newSubsection = {
// 					...dropData,
// 					id: newSubsectionId.id,
// 					localId: nextSectionId++,
// 					name: `Subsection ${parentSection.subsectionCount + 1}`,
// 					cards: [],
// 					subsections: [],
// 					subsectionCount: 0
// 				};
// 				updateSectionWithSubsection(uiSections, sectionId, newSubsection);
// 				parentSection.subsectionCount++;
// 				uiSections = [...uiSections]; // Trigger reactivity
// 				toast.success('Subsection added successfully! Please add subsection details.');
// 			}
// 		}
// 	} else if (dropData.type === 'card') {
// 		if (subsectionId !== null) {
// 			const parentSection = findSectionById(uiSections, sectionId);
// 			// const subsection = findSectionById(
// 			// 	parentSection.subsections,
// 			// 	subsectionId,
// 			// 	parentSection.localId
// 			// );
// 			let subsection;
// 			for (let sub of parentSection.subsections) {
// 				if (sub.localId === subsectionId) {
// 					console.log('local id', sub.localId);
// 					console.log('section id', subsectionId);
// 					subsection = sub;
// 				}
// 				console.log(subsection, 'subsection ');
// 			}

// 			if (subsection && !subsection.cards.some((card) => card.localId === dropData.localId)) {
// 				const questionId = await getQuestionData(
// 					parentFormTemplateId,
// 					subsection.id,
// 					dropData.value
// 				);
// 				subsection.cards = [
// 					...subsection.cards,
// 					{ ...dropData, localId: nextCardId++, id: questionId.id, Title: questionId.Title }
// 				];
// 				uiSections = [...uiSections]; // Reassign to trigger UI update
// 				toast.success('Card added successfully! Please add card details.');
// 			}
// 		} else if (sectionId !== null) {
// 			console.log(sectionId, 'this is section id');
// 			console.log(uiSections, 'this is section id');
// 			const section = findSectionById(uiSections, sectionId);
// 			if (section && !section.cards.some((card) => card.localId === dropData.localId)) {
// 				const questionId = await getQuestionData(
// 					parentFormTemplateId,
// 					section.databaseId,
// 					dropData.value
// 				);
// 				section.cards = [
// 					...section.cards,
// 					{ ...dropData, localId: nextCardId++, id: questionId.id, Title: questionId.Title }
// 				];
// 				uiSections = [...uiSections]; // Reassign to ensure reactivity
// 				toast.success('Card added successfully! Please add card details.');
// 			}
// 		}
// 	}

// 	invalidateAll();
// 	highlightedSection = null;
// 	highlightedSubSection = null;
// }