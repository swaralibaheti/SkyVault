import { Link, useLocation } from 'react-router-dom';
import { Files, Upload, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { logout } = useAuthStore();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const triggerUpload = () => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fileInput?.click();
    };

    return (
        <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            style={{
                width: '256px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(40px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.18)',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                paddingTop: '80px',
                zIndex: 40,
                display: 'none', // hidden on mobile (lg:block via Tailwind if you want)
            }}
            className="hidden lg:block"
        >
            <div style={{ padding: '32px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link
                        to="/dashboard"
                        style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.9)' : 'transparent',
                            color: isActive('/dashboard') ? 'white' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}
                    >
                        <Home size={22} />
                        Dashboard
                    </Link>

                    <Link
                        to="/dashboard"
                        style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: isActive('/dashboard') ? 'rgba(59, 130, 246, 0.9)' : 'transparent',
                            color: isActive('/dashboard') ? 'white' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}
                    >
                        <Files size={22} />
                        My Files
                    </Link>

                    <button
                        onClick={triggerUpload}
                        style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            background: 'transparent',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        <Upload size={22} />
                        Upload File
                    </button>
                </div>

                <div style={{ marginTop: '80px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={logout}
                        style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: 'none',
                            width: '100%',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;