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
            <div className="min-h-screen bg-gray-950 text-gray-100">
                <Navbar />

                <div className="flex">
                    {/* Sidebar - Only show when authenticated and on large screens */}
                    {isAuthenticated && <Sidebar />}

                    {/* Main Content Area */}
                    <main className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''} min-h-[calc(100vh-64px)]`}>
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

                            {/* Default Route */}
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