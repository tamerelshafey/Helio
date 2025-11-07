import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Role } from '../../types';
import type { Language, Partner } from '../../types';
import { translations } from '../../data/translations';
import { getPartnerByEmail } from '../../api/partners';
import { inputClasses } from '../shared/FormField';
import { HelioLogo } from '../HelioLogo';
import { partnersData } from '../../data/partners';

interface LoginPageProps {
  language: Language;
}

const LoginPage: React.FC<LoginPageProps> = ({ language }) => {
    const t = translations[language].auth;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    const handleLoginAndRedirect = async (emailToLogin: string) => {
        setError('');
        setLoading(true);

        const success = await login(emailToLogin, 'password');
        setLoading(false);
        
        if (success) {
            const partner = getPartnerByEmail(emailToLogin);
            if (partner) {
                switch (partner.role) {
                    // FIX: Use correct Role enum values for admin roles.
                    case Role.SUPER_ADMIN:
                    case Role.SERVICE_MANAGER:
                    case Role.CUSTOMER_RELATIONS_MANAGER:
                    case Role.LISTINGS_MANAGER:
                    case Role.PARTNER_RELATIONS_MANAGER:
                    case Role.CONTENT_MANAGER:
                        navigate('/admin', { replace: true });
                        break;
                    default:
                        navigate('/dashboard', { replace: true });
                }
                return;
            }
            
            navigate('/', { replace: true });

        } else {
            setError(t.loginError);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoginAndRedirect(email);
    };

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
                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {language === 'ar' ? 'أو تسجيل دخول سريع للاختبار' : 'Or quick login for testing'}
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    <button onClick={() => handleLoginAndRedirect('dev1@onlyhelio.com')} disabled={loading} className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50">
                        {t.loginAsDeveloper}
                    </button>
                    <button onClick={() => handleLoginAndRedirect('fin1@onlyhelio.com')} disabled={loading} className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50">
                        {t.loginAsFinishing}
                    </button>
                    <button onClick={() => handleLoginAndRedirect('agency1@onlyhelio.com')} disabled={loading} className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50">
                        {t.loginAsAgency}
                    </button>
                    <button onClick={() => handleLoginAndRedirect('admin@onlyhelio.com')} disabled={loading} className="w-full py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50 dark:hover:bg-red-900/40 disabled:opacity-50">
                        {t.loginAsAdmin}
                    </button>
                </div>
                 <div className="text-center">
                    <Link to="/register" className="font-medium text-amber-600 hover:text-amber-500 dark:text-amber-500 dark:hover:text-amber-400">
                        {translations[language].joinAsPartner}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;