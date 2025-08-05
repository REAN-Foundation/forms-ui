import { json } from '@sveltejs/kit';

export async function GET() {
	// Return empty response for Chrome DevTools request
	return json({});
} 