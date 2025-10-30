import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Partner } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactElement;
    role?: Partner['type'];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (role && currentUser.type !== role) {
        // Redirect if role does not match
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
