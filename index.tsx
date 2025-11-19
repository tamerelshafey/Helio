
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/auth/AuthContext';
import { ToastProvider } from './components/shared/ToastContext';
import { LanguageProvider } from './components/shared/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const queryClient = new QueryClient();

// Smart Router Selection
// Determine if we are in a preview environment that requires HashRouter.
const hostname = window.location.hostname;
const href = window.location.href;

const isPreviewEnv = 
    hostname.includes('googleusercontent.com') || 
    hostname.includes('usercontent.goog') || 
    href.includes('usercontent.goog') || // Check full URL to catch all IDX/Cloud Shell variations
    hostname.includes('webcontainer.io') ||
    hostname.includes('stackblitz.io') ||
    hostname.includes('codesandbox.io') ||
    // Fallback: if the hostname contains '.goog' but isn't the main google site, assume preview
    (hostname.includes('.goog') && !hostname.includes('www.google.com'));

// Use HashRouter for preview environments to avoid "No routes matched" errors on subpaths.
// Use BrowserRouter for production (Clean URLs).
const Router = isPreviewEnv ? HashRouter : BrowserRouter;

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <Router>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AuthProvider>
                        <LanguageProvider>
                            <App />
                        </LanguageProvider>
                    </AuthProvider>
                </ToastProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </Router>
    </React.StrictMode>,
);
