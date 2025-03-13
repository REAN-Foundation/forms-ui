import chalk from "chalk";
export interface Question {
    id: string;
    Title: string;
    Description: string | null;
    ResponseType: string;
    Options: any | null;
    RangeMin: number | null;
    RangeMax: number | null;
    DisplayCode: string;
    ParentFormSection: {
        SectionIdentifier: string;
        Title: string;
    };
}
export async function save(model) {

    console.log(model);
    const url = `/api/server/question-response`;
    const headers = { 'Content-Type': 'application/json' };
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(model),
        headers
    });
    if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const responseData = await res.json();
    console.log(
        chalk.hex('#00ff00')(JSON.stringify(responseData), 'From showdata function return')
    );
    return responseData;

}

export async function submit(FormSubmissionId: string) {
    // const FormSubmissionId = $page.params.id;
    const url = `/api/server/submit`;
    const headers = { 'Content-Type': 'application/json' };
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(FormSubmissionId),
        headers
    });
    if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const responseData = await res.json();
    console.log(
        chalk.hex('#00ff00')(JSON.stringify(responseData), 'From showdata function return')
    );
    return responseData;

}