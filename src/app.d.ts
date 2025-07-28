/// <reference types="@sveltejs/kit" />

declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

declare module '$env/static/private' {
	export const BACKEND_API_URL: string;
	export const INTERNAL_API_KEY: string;
	export const TOKEN: string;
}
