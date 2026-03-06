import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../common/AxiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Admin.css';

export default function AdminLogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/api/users/login', form);
            if (data.type !== 'admin') {
                toast.error('Access denied. Admin credentials required.');
                return;
            }
            login(data);
            toast.success(`Welcome, ${data.name}! Admin panel loaded.`);
            navigate('/admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-bg">
                <div className="admin-login-orb orb1"></div>
                <div className="admin-login-orb orb2"></div>
                <div className="admin-login-orb orb3"></div>
            </div>

            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-login-shield">
                        <span>🛡️</span>
                    </div>
                    <h1>Admin Portal</h1>
                    <p>LearnHub Administration Panel</p>
                    <div className="admin-login-warning">
                        <span>⚠️</span> Restricted access — Admins only
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    <div className="admin-form-group">
                        <label htmlFor="admin-email">Admin Email</label>
                        <div className="admin-input-wrapper">
                            <span className="admin-input-icon">✉️</span>
                            <input
                                id="admin-email"
                                type="email"
                                name="email"
                                placeholder="admin@learnhub.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="admin-password">Password</label>
                        <div className="admin-input-wrapper">
                            <span className="admin-input-icon">🔒</span>
                            <input
                                id="admin-password"
                                type="password"
                                name="password"
                                placeholder="••••••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? (
                            <span className="admin-login-spinner"></span>
                        ) : (
                            <>
                                <span>🔑</span> Access Admin Panel
                            </>
                        )}
                    </button>
                </form>

                <p className="admin-login-footer">
                    Not an admin? <a href="/login">Go to regular login</a>
                </p>
            </div>
        </div>
    );
}
