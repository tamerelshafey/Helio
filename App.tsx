

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ScrollToTop from './components/shared/ScrollToTop';
import { FavoritesProvider } from './components/shared/FavoritesContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Permission } from './types';
import ToastContainer from './components/ui/ToastContainer';
import BackToTopButton from './components/ui/BackToTopButton';
import { useLanguage } from './components/shared/LanguageContext';
import { adminNavLinks, partnerNavLinks } from './data/navigation';

// --- Layouts ---
const DashboardLayout = React.lazy(() => import('./components/shared/DashboardLayout'));

// --- Fallback Component ---
const LoadingFallback = () => (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
    </div>
);

// --- Route Groups (Code Splitting) ---
const PublicRoutes = React.lazy(() => import('./components/public/PublicRoutes'));
const PartnerRoutes = React.lazy(() => import('./components/partner-dashboard/PartnerRoutes'));
const AdminRoutes = React.lazy(() => import('./components/admin/AdminRoutes'));


const App: React.FC = () => {
    const { t } = useLanguage();

    return (
        <FavoritesProvider>
            <div>
                <ScrollToTop />
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        {/* ================================================================== */}
                        {/*                        Protected Partner Dashboard                   */}
                        {/* ================================================================== */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute permission={Permission.VIEW_PARTNER_DASHBOARD}>
                                    <DashboardLayout navLinks={partnerNavLinks} pageTitle={t.dashboard.title} />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="*" element={<PartnerRoutes />} />
                        </Route>

                        {/* ================================================================== */}
                        {/*                   Protected Super Admin Dashboard                  */}
                        {/* ================================================================== */}
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute permission={Permission.VIEW_ADMIN_DASHBOARD}>
                                    <DashboardLayout navLinks={adminNavLinks} pageTitle={t.adminDashboard.title} />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="*" element={<AdminRoutes />} />
                        </Route>

                        {/* ================================================================== */}
                        {/*         Public Routes (Catch-all, must be last)                    */}
                        {/* ================================================================== */}
                        <Route path="/*" element={<PublicRoutes />} />

                    </Routes>
                </Suspense>
                <ToastContainer />
                <BackToTopButton />
            </div>
        </FavoritesProvider>
    );
};

export default App;