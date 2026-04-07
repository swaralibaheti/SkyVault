import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error("Please fill all fields");
            return;
        }

        setIsLoading(true);
        try {
            await login(username, password);
            toast.success("Welcome back to SkyVault! 🎉");
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
        >
            {/* Futuristic background glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    background: 'rgba(15, 23, 42, 0.65)',           // More transparent for stronger glassmorphism
                    backdropFilter: 'blur(40px)',                     // Increased blur for glass effect
                    border: '1px solid rgba(255, 255, 255, 0.18)',    // Softer, glass-like border
                    borderRadius: '28px',
                    padding: '55px 45px',
                    boxShadow: '0 35px 70px -15px rgba(30, 58, 138, 0.7)',
                    boxSizing: 'border-box',                          // Extra safety
                }}
            >
                {/* ONLY ONE CENTERED LOGO (left-aligned logo completely removed) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px' }}>
                    <img
                        src="/skyvault_logo.png"
                        alt="SkyVault"
                        style={{
                            height: '95px',
                            width: 'auto',
                            filter: 'drop-shadow(0 20px 30px rgba(59, 130, 246, 0.5))',
                        }}
                    />
                </div>

                <h1
                    style={{
                        fontSize: '38px',
                        fontWeight: '700',
                        color: '#ffffff',
                        textAlign: 'center',
                        marginBottom: '8px',
                        letterSpacing: '-1.5px',
                    }}
                >
                    Welcome Back
                </h1>

                <p
                    style={{
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginBottom: '45px',
                        fontSize: '18px',
                    }}
                >
                    Sign in to your secure vault
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div style={{ marginBottom: '28px' }}>
                        <label
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                marginBottom: '8px',
                                display: 'block',
                            }}
                        >
                            Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User
                                size={24}
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }}
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px 18px 58px',
                                    background: 'rgba(255, 255, 255, 0.1)',   // Glassy input
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',                 // ← Fixes overflow
                                    backdropFilter: 'blur(12px)',            // Extra glass on input
                                }}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '40px' }}>
                        <label
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                marginBottom: '8px',
                                display: 'block',
                            }}
                        >
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={24}
                                style={{
                                    position: 'absolute',
                                    left: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }}
                            />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px 18px 58px',
                                    background: 'rgba(255, 255, 255, 0.1)',   // Glassy input
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',                 // ← Fixes overflow
                                    backdropFilter: 'blur(12px)',            // Extra glass on input
                                }}
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '20px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                }}
                            >
                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Sign In Button */}
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '19px',
                            background: 'linear-gradient(90deg, #3b82f6, #22d3ee)',
                            color: 'white',
                            fontSize: '19px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 15px 35px -10px rgba(59, 130, 246, 0.7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxSizing: 'border-box',   // Extra safety
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        border: '3px solid white',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '40px',
                        color: '#94a3b8',
                        fontSize: '15px',
                    }}
                >
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        style={{ color: '#ffffff', fontWeight: '500', textDecoration: 'none' }}
                    >
                        Create one free
                    </Link>
                </p>
            </motion.div>

            {/* Spinner Animation */}
            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default LoginPage;