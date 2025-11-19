
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    resolve: {
        alias: [
            { find: /^api\/(.*)/, replacement: path.resolve('services/$1') },
            { find: /^\.\.\/api\/(.*)/, replacement: path.resolve('services/$1') },
            { find: /^\.\.\/\.\.\/api\/(.*)/, replacement: path.resolve('services/$1') }
        ]
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
