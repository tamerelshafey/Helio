import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Corrected import path from 'api' to 'mockApi'.
import { getPartnerByEmail, getPartnerById } from '../../mockApi/partners';
import { Role, Permission } from '../../types';
import type { Partner } from '../../types';
import { rolePermissions } from '../../data/permissions';

interface AuthContextType {
    currentUser: Partner | null;
    permissions: Permission[];
    hasPermission: (permission: Permission) => boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Partner | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const setUserAndPermissions = (user: Partner | null) => {
        setCurrentUser(user);
        if (user) {
            setPermissions(rolePermissions.get(user.role) || []);
        } else {
            setPermissions([]);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const userId = localStorage.getItem('onlyhelio-auth-id');
                if (userId) {
                    let user: Partner | undefined = getPartnerById(userId);
                    if (user) {
                        setUserAndPermissions(user);
                    }
                }
            } catch (error) {
                console.error("Error reading from localStorage", error);
            } finally {
                setLoading(false);
            }
        };
        initializeAuth();
    }, []);

    const login = async (email: string, pass: string): Promise<boolean> => {
        let user: Partner | undefined = getPartnerByEmail(email);

        if (user) {
            localStorage.setItem('onlyhelio-auth-id', user.id);
            localStorage.setItem('onlyhelio-auth-role', user.role);
            setUserAndPermissions(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('onlyhelio-auth-id');
        localStorage.removeItem('onlyhelio-auth-role');
        setUserAndPermissions(null);
        navigate('/');
    };

     const hasPermission = (permission: Permission): boolean => {
        if (!currentUser) {
            return false;
        }
        if (currentUser.role === Role.SUPER_ADMIN) {
            return true;
        }
        return permissions.includes(permission);
    };

    const value = {
        currentUser,
        permissions,
        hasPermission,
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