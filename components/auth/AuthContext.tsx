import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPartnerByEmail, getPartnerById } from '../../api/partners';
import type { Partner } from '../../types';

interface AuthContextType {
    currentUser: Partner | null;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const partnerId = localStorage.getItem('onlyhelio-partner-id');
            if (partnerId) {
                const partner = getPartnerById(partnerId);
                if (partner) {
                    setCurrentUser(partner);
                }
            }
        } catch (error) {
            console.error("Error reading from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, pass: string): Promise<boolean> => {
        const partner = getPartnerByEmail(email);
        if (partner && partner.password === pass) {
            localStorage.setItem('onlyhelio-partner-id', partner.id);
            setCurrentUser(partner);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('onlyhelio-partner-id');
        setCurrentUser(null);
        navigate('/');
    };

    const value = {
        currentUser,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};