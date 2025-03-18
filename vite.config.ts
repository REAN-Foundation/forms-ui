import { defineConfig } from "vitest/config";
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
    plugins: [sveltekit()],

    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    optimizeDeps: {
        entries: ['src/routes/**/+*.{js,ts,svelte}', 'src/hooks*.{js,ts}']
    },
    build: {
        rollupOptions: {
            external: ["bits-ui"]
        }
    }
});
