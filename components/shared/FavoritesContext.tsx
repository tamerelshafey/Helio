
import React, { createContext, useState, useEffect, useContext, ReactNode, useMemo, useCallback } from 'react';
import { FavoriteItem } from '../../types';

interface FavoritesContextType {
    favorites: FavoriteItem[];
    isFavorite: (id: string, type: 'property' | 'service' | 'portfolio') => boolean;
    toggleFavorite: (id: string, type: 'property' | 'service' | 'portfolio') => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
        try {
            const item = window.localStorage.getItem('onlyhelio-favorites-v2');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading favorites from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('onlyhelio-favorites-v2', JSON.stringify(favorites));
        } catch (error) {
            console.error("Error saving favorites to localStorage", error);
        }
    }, [favorites]);

    const toggleFavorite = useCallback((id: string, type: 'property' | 'service' | 'portfolio') => {
        setFavorites(prevFavorites => {
            const existingIndex = prevFavorites.findIndex(fav => fav.id === id && fav.type === type);
            if (existingIndex > -1) {
                return prevFavorites.filter((_, index) => index !== existingIndex);
            } else {
                return [...prevFavorites, { id, type }];
            }
        });
    }, []);

    const isFavorite = useCallback((id: string, type: 'property' | 'service' | 'portfolio') => {
        return favorites.some(fav => fav.id === id && fav.type === type);
    }, [favorites]);

    const value = useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites, isFavorite, toggleFavorite]);

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
