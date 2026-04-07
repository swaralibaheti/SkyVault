import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            toast.success("Account created successfully! Please login.");
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
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
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    borderRadius: '28px',
                    padding: '55px 45px',
                    boxShadow: '0 35px 70px -15px rgba(30, 58, 138, 0.7)',
                    boxSizing: 'border-box',
                }}
            >
                {/* CENTERED SKYVAULT LOGO - matching LoginPage */}
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
                    Create Account
                </h1>

                <p
                    style={{
                        color: '#94a3b8',
                        textAlign: 'center',
                        marginBottom: '45px',
                        fontSize: '18px',
                    }}
                >
                    Join SkyVault — Secure Cloud Storage
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
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backdropFilter: 'blur(12px)',
                                }}
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '28px' }}>
                        <label
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                marginBottom: '8px',
                                display: 'block',
                            }}
                        >
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail
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
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px 18px 58px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backdropFilter: 'blur(12px)',
                                }}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '28px' }}>
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
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backdropFilter: 'blur(12px)',
                                }}
                                placeholder="Create a strong password"
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

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '40px' }}>
                        <label
                            style={{
                                color: '#94a3b8',
                                fontSize: '15px',
                                marginBottom: '8px',
                                display: 'block',
                            }}
                        >
                            Confirm Password
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
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '18px 20px 18px 58px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '17px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    backdropFilter: 'blur(12px)',
                                }}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Create Account Button */}
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
                            boxSizing: 'border-box',
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
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
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
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        style={{ color: '#ffffff', fontWeight: '500', textDecoration: 'none' }}
                    >
                        Sign in
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

export default RegisterPage;