import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            external: [
                'react',
                'react-router-dom',
                'react-hook-form',
                '@google/genai',
                '@tanstack/react-query',
                '@tanstack/react-query-devtools',
                'chart.js',
                'react-chartjs-2',
                'jspdf',
                'jspdf-autotable',
                /^react\//,
                /^react-dom\//,
            ],
        },
    },
});
