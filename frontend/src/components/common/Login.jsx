import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

export default function Login() {
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
            login(data);
            toast.success(`Welcome back, ${data.name}!`);
            if (data.type === 'admin') navigate('/admin');
            else if (data.type === 'teacher') navigate('/teacher');
            else navigate('/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <span className="logo-icon">🎓</span>
                    <h1>LearnHub</h1>
                    <p>Your Center For Skill Enhancement</p>
                </div>
                <h2>Welcome Back</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Sign In'}
                    </button>
                </form>
                <p className="auth-switch">
                    New to LearnHub? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
}
