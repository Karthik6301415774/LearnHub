import { useState, useEffect } from 'react';
import axiosInstance from '../common/AxiosInstance';
import { toast } from 'react-toastify';
import './Admin.css';

export default function AdminHome() {
    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0 });
    const [users, setUsers] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes, enrollRes] = await Promise.all([
                axiosInstance.get('/api/admin/stats'),
                axiosInstance.get('/api/admin/users'),
                axiosInstance.get('/api/admin/enrollments')
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.filter(u => u.type !== 'admin'));
            setEnrollments(enrollRes.data);
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await axiosInstance.delete(`/api/admin/users/${id}`);
            toast.success('User deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>📊 Admin Dashboard</h1>
                <p>Platform overview and management</p>
            </div>

            <div className="admin-stats-grid">
                <div className="a-stat-card">
                    <div className="icon blue">👥</div>
                    <div>
                        <div className="a-stat-num">{stats.totalUsers}</div>
                        <div className="a-stat-label">Total Users</div>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="icon purple">📚</div>
                    <div>
                        <div className="a-stat-num">{stats.totalCourses}</div>
                        <div className="a-stat-label">Total Courses</div>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="icon green">🎓</div>
                    <div>
                        <div className="a-stat-num">{stats.totalEnrollments}</div>
                        <div className="a-stat-label">Total Enrollments</div>
                    </div>
                </div>
                <div className="a-stat-card">
                    <div className="icon yellow">💰</div>
                    <div>
                        <div className="a-stat-num">₹{stats.totalRevenue}</div>
                        <div className="a-stat-label">Total Revenue</div>
                    </div>
                </div>
            </div>

            <div className="admin-tables-container">
                {/* Users Table */}
                <div className="admin-table-card">
                    <h2>User Management</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Registered</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td><span className={`role-badge ${u.type}`}>{u.type}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => handleDeleteUser(u._id)} className="btn-table-del">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Enrollments Table */}
                <div className="admin-table-card">
                    <h2>Recent Enrollments</h2>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.slice(0, 10).map(e => (
                                    <tr key={e._id}>
                                        <td>{e.studentId?.name || 'Unknown'}</td>
                                        <td>{e.courseId?.C_title || 'Unknown'}</td>
                                        <td>
                                            <span className={`status-badge ${e.isPaid ? 'paid' : 'unpaid'}`}>
                                                {e.isPaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-cell">
                                                <div className="progress-bar-small">
                                                    <div className="progress-fill-small" style={{ width: `${e.progress}%` }}></div>
                                                </div>
                                                {e.progress}%
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
