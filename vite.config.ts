
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        // Bundling configuration:
        // We have removed 'rollupOptions.external' to ensure all dependencies (React, etc.)
        // are bundled into the build artifacts. This makes the app self-contained
        // and suitable for production deployment on platforms like Vercel.
    },
});