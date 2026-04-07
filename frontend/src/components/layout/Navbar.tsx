import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Files, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(40px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
        >
            <div
                style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Minimal text only (logo removed) */}
                <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', letterSpacing: '-1px' }}>
                        SKYVAULT
                    </h1>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {isAuthenticated && (
                        <>
                            <Link
                                to="/dashboard"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: '#94a3b8',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}
                            >
                                <Files size={20} />
                                My Files
                            </Link>

                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload size={20} />
                                Upload
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            padding: '10px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '12px',
                            color: '#94a3b8',
                            cursor: 'pointer',
                        }}
                    >
                        {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#f87171',
                                background: 'none',
                                border: 'none',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            <LogOut size={22} />
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;