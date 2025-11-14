import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Theme } from '../../types';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        try {
            const savedTheme = localStorage.getItem('onlyhelio-theme') as Theme;
            if (savedTheme) {
                return savedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } catch (error) {
            console.error("Failed to read theme from localStorage", error);
            return 'light';
        }
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        try {
            localStorage.setItem('onlyhelio-theme', theme);
        } catch (error) {
            console.error("Failed to save theme to localStorage", error);
        }
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
    }, []);

    const value = { theme, setTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};