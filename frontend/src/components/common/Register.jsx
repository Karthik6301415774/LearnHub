import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', type: 'student' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/api/users/register', form);
            login(data);
            toast.success(`Account created! Welcome, ${data.name}!`);
            if (data.type === 'teacher') navigate('/teacher');
            else navigate('/student');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
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
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>I am a</label>
                        <select name="type" value={form.type} onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner"></span> : 'Create Account'}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
