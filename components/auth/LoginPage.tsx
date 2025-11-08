import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Role, Permission } from '../../types';
import type { Language, Partner } from '../../types';
import { translations } from '../../data/translations';
import { getPartnerByEmail } from '../../api/partners';
import { inputClasses } from '../shared/FormField';
import { HelioLogo } from '../HelioLogo';
import { partnersData } from '../../data/partners';
import { rolePermissions } from '../../data/permissions';
import { useLanguage } from '../shared/LanguageContext';

const LoginPage: React.FC = () => {
    const { language } = useLanguage();
    const t = translations[language].auth;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginAndRedirect = async (emailToLogin: string) => {
        setError('');
        setLoading(true);

        const user = await login(emailToLogin, 'password');
        setLoading(false);
        
        if (user) {
            const permissions = rolePermissions.get(user.role) || [];
            const isAdmin = permissions.includes(Permission.VIEW_ADMIN_DASHBOARD);

            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(t.loginError);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoginAndRedirect(email);
    };

    const quickLoginUsers = useMemo(() => {
        const quickLoginEmails = [
            'admin@onlyhelio.com',
            'dev1@onlyhelio.com',
            'fin1@onlyhelio.com',
            'agency1@onlyhelio.com',
            'service-manager@onlyhelio.com',
            'customer-relations-manager@onlyhelio.com',
            'listings-manager@onlyhelio.com',
            'partner-relations-manager@onlyhelio.com',
            'content-manager@onlyhelio.com',
        ];

        return quickLoginEmails
            .map(email => {
                const partner = partnersData.find(p => p.email === email);
                if (!partner) return null;
                const localizedInfo = (translations[language].partnerInfo as any)[partner.id];
                return {
                    name: localizedInfo?.name || partner.id,
                    email: partner.email,
                };
            })
            .filter(Boolean) as { name: string; email: string }[];
    }, [language]);


    return (
        <div className="py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="w-full max-w-lg p-8 space-y-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-4">
                        <HelioLogo className="h-10 w-10" />
                        <span className="text-2xl">ONLY HELIO</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.loginTitle}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t.loginSubtitle}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t.email}</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={inputClasses}
                                placeholder={t.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="pt-4">
                            <label htmlFor="password" className="sr-only">{t.password}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className={inputClasses}
                                placeholder={t.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                        >
                            {loading ? '...' : t.loginButton}
                        </button>
                    </div>
                </form>
                 <div className="text-center">
                    <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400">
                        {translations[language].joinAsPartner}
                    </Link>
                </div>

                {/* Quick Login Section for Demo/Testing Purposes */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
                        {language === 'ar' ? 'للتجربة: تسجيل دخول سريع' : 'For Demo: Quick Logins'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {quickLoginUsers.map(user => (
                            <button
                                key={user.email}
                                onClick={() => handleLoginAndRedirect(user.email)}
                                disabled={loading}
                                className="w-full text-center text-xs p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {user.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;