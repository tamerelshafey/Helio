
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {}
    },
    resolve: {
        alias: [
            { find: /^api\/(.*)/, replacement: path.resolve(__dirname, 'services/$1') },
            { find: /^\.\/api\/(.*)/, replacement: path.resolve(__dirname, 'services/$1') },
            { find: /^\.\.\/api\/(.*)/, replacement: path.resolve(__dirname, 'services/$1') },
            { find: /^\.\.\/\.\.\/api\/(.*)/, replacement: path.resolve(__dirname, 'services/$1') },
            { find: /^\.\.\/\.\.\/\.\.\/api\/(.*)/, replacement: path.resolve(__dirname, 'services/$1') }
        ]
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});
