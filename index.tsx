import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/auth/AuthContext';
import { ToastProvider } from './components/shared/ToastContext';
import { LanguageProvider } from './components/shared/LanguageContext';
import { ThemeProvider } from './components/shared/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

const queryClient = new QueryClient();

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <HashRouter>
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <AuthProvider>
                        <LanguageProvider>
                            <ThemeProvider>
                                <App />
                            </ThemeProvider>
                        </LanguageProvider>
                    </AuthProvider>
                </ToastProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </HashRouter>
    </React.StrictMode>,
);
