import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/dashboard/Dashboard';
import { useAuthStore } from './store/authStore';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <Router>
            <div
                style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
            >
                {/* Navbar only on authenticated pages */}
                {isAuthenticated && <Navbar />}

                <div style={{ display: 'flex', flex: 1 }}>
                    {/* Sidebar only on authenticated pages */}
                    {isAuthenticated && <Sidebar />}

                    {/* Main Content */}
                    <main
                        style={{
                            flex: 1,
                            marginLeft: isAuthenticated ? '256px' : '0', // 64px * 4 = 256px (sidebar width)
                            minHeight: 'calc(100vh - 64px)',
                            padding: isAuthenticated ? '20px' : '0',
                        }}
                    >
                        <Routes>
                            {/* Public Routes */}
                            <Route
                                path="/login"
                                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
                            />
                            <Route
                                path="/register"
                                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
                            />

                            {/* Protected Route */}
                            <Route
                                path="/dashboard"
                                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
                            />

                            {/* Default */}
                            <Route
                                path="/"
                                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
                            />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;