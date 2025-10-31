import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { Language } from '../../types';
import { translations } from '../../data/translations';
import { getTestPartners, getPartnerByEmail } from '../../api/partners';
import { inputClasses } from '../shared/FormField';

interface LoginPageProps {
    language: Language;
}

const LoginPage: React.FC<LoginPageProps> = ({ language }) => {
    const t = translations[language].auth;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [testRoles, setTestRoles] = useState<{id: string; email?: string; password?: string, type?: string, roleName: string}[]>([]);

    useEffect(() => {
        const partners = getTestPartners(language);
        const roles: { [key: string]: any } = {};
    
        // Define role order
        const roleOrder = ['admin', 'developer', 'finishing', 'agency', 'decorations'];
    
        partners.forEach(p => {
            if (p.type && !roles[p.type]) {
                let roleName = '';
                switch(p.type) {
                    case 'developer': roleName = t.loginAsDeveloper; break;
                    case 'finishing': roleName = t.loginAsFinishing; break;
                    case 'agency': roleName = t.loginAsAgency; break;
                    case 'admin': roleName = t.loginAsAdmin; break;
                    case 'decorations': roleName = t.loginAsDecorations; break;
                    default: roleName = p.type;
                }
                roles[p.type] = { ...p, roleName };
            }
        });
    
        const sortedRoles = roleOrder
            .map(roleKey => roles[roleKey])
            .filter(Boolean); // Filter out any roles not present in the data
    
        setTestRoles(sortedRoles);
    }, [language, t]);

    const handleLogin = async (loginEmail: string, loginPass: string) => {
        setError('');
        setLoading(true);

        const success = await login(loginEmail, loginPass);
        
        setLoading(false);
        if (success) {
            const partner = getPartnerByEmail(loginEmail);
            if (partner?.type === 'admin') {
                navigate('/admin', { replace: true });
            } else if (partner?.type === 'finishing') {
                navigate('/dashboard/portfolio', { replace: true });
            } else if (partner?.type === 'decorations') {
                navigate('/decorations-admin', { replace: true });
            }
             else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(t.loginError);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="w-full max-w-lg p-8 space-y-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-amber-500">{t.loginTitle}</h1>
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
                            />
                        </div>
                        <div className="pt-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.password}</label>
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

                <div className="mt-8 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                {t.quickLogin}
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {testRoles.map(role => (
                            <button
                                key={role.type}
                                type="button"
                                onClick={() => role.email && role.password && handleLogin(role.email, role.password)}
                                disabled={loading}
                                className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 ${role.type === 'admin' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                            >
                                {role.roleName}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;