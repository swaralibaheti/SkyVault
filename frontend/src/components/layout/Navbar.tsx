import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Files, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(true); // Default dark mode to match logo

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <img
                        src="/skyvault_logo.png"
                        alt="SkyVault Logo"
                        className="h-10 w-auto"
                    />
                    <div className="hidden sm:block">
                        <h1 className="text-2xl font-bold tracking-tighter text-white">SKYVAULT</h1>
                    </div>
                </Link>

                <div className="flex items-center gap-6">
                    {isAuthenticated && (
                        <>
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                            >
                                <Files size={18} />
                                My Files
                            </Link>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
                            >
                                <Upload size={18} />
                                Upload
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;