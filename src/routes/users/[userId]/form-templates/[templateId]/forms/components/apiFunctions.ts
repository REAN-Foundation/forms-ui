export async function getQuestionById(questionId: string) {
    try {
        const url = `/api/server/question/${questionId}`;
        const headers = { 'Content-Type': 'application/json' };
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`HTTP error ${response.status}: ${error.message}`);
        }

        const { Data: question } = await response.json();
        return question;
    } catch (error) {
        console.error('Error fetching question data:', error);
        throw error;
    }
}

// export async function createNewSection(model: { parentFormTemplateId: string, parentSectionId: string }) {
//     try {
//         const response = await fetch(`/api/server/section`, {
//             method: 'POST',
//             body: JSON.stringify(model),
//             headers: { 'content-type': 'application/json' },
//         });

//         if (!response.ok) {
//             const error = await response.json();
//             throw new Error(`HTTP error ${response.status}: ${error.message}`);
//         }

//         const sectionData= await response.json();
//         return sectionData.data.Data;
//     } catch (error) {
//         console.error('Error creating new section:', error);
//         throw error;
//     }
// }
export async function createNewSection(model: { parentFormTemplateId: string, parentSectionId: string }) {
    console.log(model);
    const response = await fetch(`/api/server/section`, {
        method: 'POST',
        body: JSON.stringify(model),
        headers: { 'content-type': 'application/json' }
    });
    const res = await response.json();
    const sectionData = res.Data;
    if (res.error) {
        console.log('Error:', res.error);
        return res.error;
    }
    return sectionData;
}

export async function createNewQuestion(model: { parentFormTemplateId: string, parentSectionId: string, responseType: string }) {
    try {
        const response = await fetch(`/api/server/question`, {
            method: 'POST',
            body: JSON.stringify(model),
            headers: { 'content-type': 'application/json' },
        });

        // if (!response.ok) {
        //     const error = await response.json();
        //     throw new Error(`HTTP error ${response.status}: ${error.message}`);
        // }

        const questionData = await response.json();
        return questionData;
    } catch (error) {
        console.error('Error creating new question:', error);
        throw error;
    }
}

export async function fetchSectionData(sectionId: string) {
    try {
        const response = await fetch(`/api/server/section/${sectionId}`, {
            method: 'GET',
            headers: { 'content-type': 'application/json' },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`HTTP error ${response.status}: ${error.message}`);
        }

        const sectionData = await response.json();
        return sectionData;
    } catch (error) {
        console.error('Error fetching section data:', error);
        throw error;
    }
}

export async function deleteSection(model: { sectionId: string }) {
    try {
        const response = await fetch(`/api/server/section`, {
            method: 'DELETE',
            body: JSON.stringify(model),
            headers: { 'content-type': 'application/json' },
        });

        if (!response.ok) {
            try {
                const error = await response.json(); // Parse the error response
                throw new Error(`HTTP error ${response.status}: ${error.message}`);
            } catch {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
        }

        // Handle cases where no content is returned
        if (response.status === 204) {
            console.log('No content returned from server.');
            return { status: 'success', message: 'Section deleted successfully!' };
        }

        // Parse the response for other status codes
        const res = await response.json();
        console.log('Parsed Response:', res);
        return res;
    } catch (error) {
        console.error('Error in deleteSection:', error);
        throw error;
    }
}

export async function deleteQuestion(model: { questionId: string }) {
    try {
        const response = await fetch(`/api/server/question`, {
            method: 'DELETE',
            body: JSON.stringify(model),
            headers: { 'Content-Type': 'application/json' },
        });

        // Check if the response status is not okay
        if (!response.ok) {
            let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
            try {
                // Attempt to parse the error response for more details
                const error = await response.json();
                if (error.message) {
                    errorMessage = `HTTP error ${response.status}: ${error.message}`;
                }
            } catch {
                // If parsing fails, keep the default error message
            }
            throw new Error(errorMessage);
        }

        // If status is 204, return a default success message
        if (response.status === 204) {
            return { message: 'No content' };
        }

        // Parse and return the JSON response
        const res = await response.json();
        return res;
    } catch (err) {
        const error = err as Error;
        console.error('Error deleting question:', error.message || error);
        throw error;
    }
}
