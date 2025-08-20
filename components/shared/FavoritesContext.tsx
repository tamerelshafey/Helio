import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface FavoritesContextType {
    favorites: string[];
    isFavorite: (id: string) => boolean;
    toggleFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            const item = window.localStorage.getItem('onlyhelio-favorites');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading favorites from localStorage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem('onlyhelio-favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Error saving favorites to localStorage", error);
        }
    }, [favorites]);

    const toggleFavorite = (id: string) => {
        setFavorites(prevFavorites => {
            if (prevFavorites.includes(id)) {
                return prevFavorites.filter(favId => favId !== id);
            } else {
                return [...prevFavorites, id];
            }
        });
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
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
