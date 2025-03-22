export class ResponseHandler {
    static success(response: any): Response {
        return new Response(JSON.stringify(response), {
            status: response.HttpCode || 200, 
            headers: { 'Content-Type': 'application/json' },
        });
    }

    static handleError(error: any): Response {
        console.error('Error:', error);

        return new Response(
            JSON.stringify({
                Status: 'failure',
                HttpCode: 500,
                Message: error instanceof Error ? error.message : 'An error occurred while processing the request.',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
