import { Link, useLocation } from 'react-router-dom';
import { Files, Upload, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    // Trigger file upload from sidebar
    const triggerUpload = () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
    };

    return (
        <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="w-64 bg-gray-900 border-r border-gray-800 h-screen fixed left-0 top-0 pt-20 hidden lg:block z-40"
        >
            <div className="px-6 py-8">
                <div className="space-y-2">
                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                            isActive('/dashboard')
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Home size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                            isActive('/dashboard')
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Files size={20} />
                        <span className="font-medium">My Files</span>
                    </Link>

                    <button
                        onClick={triggerUpload}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                    >
                        <Upload size={20} />
                        <span className="font-medium">Upload File</span>
                    </button>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-950/50 hover:text-red-500 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;