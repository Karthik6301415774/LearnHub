import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NavBar.css';

export default function NavBar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const dashboardLink = () => {
        if (!user) return null;
        if (user.type === 'admin') return '/admin';
        if (user.type === 'teacher') return '/teacher';
        return '/student';
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <span className="brand-icon">🎓</span>
                <span className="brand-text">LearnHub</span>
            </Link>

            <div className="nav-links">
                <Link to="/courses" className="nav-link">Explore</Link>
                {user ? (
                    <>
                        <Link to={dashboardLink()} className="nav-link">Dashboard</Link>
                        <div className="nav-user">
                            <span className={`user-badge user-badge--${user.type}`}>{user.type}</span>
                            <span className="user-name">{user.name}</span>
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Sign In</Link>
                        <Link to="/register" className="btn-nav-cta">Get Started</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
