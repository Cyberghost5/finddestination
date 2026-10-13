import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['src/index.css', 'src/main.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: 'src/main.jsx',
                css: 'src/index.css',
            },
        },
    },
});
