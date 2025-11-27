import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    utils: ['react-hook-form', '@tanstack/react-query'],
                    charts: ['chart.js', 'react-chartjs-2'],
                    pdf: ['jspdf', 'jspdf-autotable'],
                },
            },
        },
    },
});