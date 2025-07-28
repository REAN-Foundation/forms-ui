import { error } from '@sveltejs/kit';

export class ResponseHandler {
    static success(data: any) {
        return new Response(JSON.stringify(data));
    }

    static handleError(err: any) {
        console.error('API Error:', err);

        const errorMessage = err.message || 'An unexpected error occurred';
        const statusCode = err.status || err.statusCode || 500;
        const errorDetails = {
            message: errorMessage,
            status: statusCode,
            timestamp: new Date().toISOString(),
            path: err.path || 'unknown',
            stack: import.meta.env.DEV ? err.stack : undefined
        };

        return new Response(
            JSON.stringify({
                error: errorDetails,
                success: false
            }),
            {
                status: statusCode,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
