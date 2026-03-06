import { useState, useEffect } from 'react';
import axiosInstance, { BACKEND_URL } from '../common/AxiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const TABS = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'teachers', label: '🏫 Teacher Approvals', icon: '🏫' },
    { id: 'enrollments', label: '🎓 Enrollments', icon: '🎓' },
    { id: 'courses', label: '📚 Courses', icon: '📚' },
    { id: 'live-sessions', label: '🔴 Live Sessions', icon: '🔴' },
    { id: 'payments', label: '💳 Payments', icon: '💳' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
];

export default function AdminHome() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalEnrollments: 0, totalRevenue: 0 });
    const [users, setUsers] = useState([]);
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [payments, setPayments] = useState([]);
    const [qrImage, setQrImage] = useState(null);
    const [qrFile, setQrFile] = useState(null);
    const [qrUploading, setQrUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchUser, setSearchUser] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, pendingRes, enrollRes, coursesRes, paymentsRes, qrRes, liveRes] = await Promise.all([
                axiosInstance.get('/api/admin/stats'),
                axiosInstance.get('/api/admin/users'),
                axiosInstance.get('/api/admin/pending-teachers'),
                axiosInstance.get('/api/admin/enrollments'),
                axiosInstance.get('/api/users/courses'),
                axiosInstance.get('/api/admin/payments'),
                axiosInstance.get('/api/admin/settings/upi-qr'),
                axiosInstance.get('/api/admin/all-live-sessions'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data.filter(u => u.type !== 'admin'));
            setPendingTeachers(pendingRes.data);
            setEnrollments(enrollRes.data);
            setCourses(coursesRes.data);
            setPayments(paymentsRes.data);
            setLiveSessions(liveRes.data);
            setQrImage(qrRes.data.imageUrl || null);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
        try {
            await axiosInstance.delete(`/api/admin/users/${id}`);
            toast.success('User deleted successfully');
            fetchAll();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const handleApproveTeacher = async (id) => {
        try {
            await axiosInstance.put(`/api/admin/approve-teacher/${id}`);
            toast.success('✅ Teacher approved! They can now log in.');
            fetchAll();
        } catch {
            toast.error('Failed to approve teacher');
        }
    };

    const handleRejectTeacher = async (id) => {
        if (!window.confirm('Reject and remove this teacher application? This cannot be undone.')) return;
        try {
            await axiosInstance.delete(`/api/admin/reject-teacher/${id}`);
            toast.success('Teacher application rejected and removed.');
            fetchAll();
        } catch {
            toast.error('Failed to reject teacher');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleQrUpload = async () => {
        if (!qrFile) return toast.error('Please select an image file first');
        const formData = new FormData();
        formData.append('qr', qrFile);
        setQrUploading(true);
        try {
            const { data } = await axiosInstance.post('/api/admin/settings/upi-qr', formData);
            toast.success('UPI QR updated successfully!');
            setQrImage(data.imageUrl);
            setQrFile(null);
        } catch {
            toast.error('Failed to upload QR');
        } finally {
            setQrUploading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
    );

    const teacherCount = users.filter(u => u.type === 'teacher').length;
    const studentCount = users.filter(u => u.type === 'student').length;

    if (loading) {
        return (
            <div className="admin-loading-screen">
                <div className="admin-loading-spinner"></div>
                <p>Loading Admin Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="sidebar-logo">🛡️</span>
                    <div>
                        <div className="sidebar-title">LearnHub</div>
                        <div className="sidebar-sub">Admin Panel</div>
                    </div>
                </div>

                <div className="sidebar-admin-info">
                    <div className="sidebar-avatar">{user?.name?.[0] || 'A'}</div>
                    <div>
                        <div className="sidebar-admin-name">{user?.name}</div>
                        <div className="sidebar-admin-email">{user?.email}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            id={`nav-${tab.id}`}
                        >
                            <span className="nav-item-icon">{tab.icon}</span>
                            <span>{tab.label.split(' ').slice(1).join(' ')}</span>
                            {tab.id === 'teachers' && pendingTeachers.length > 0 && (
                                <span className="nav-badge">{pendingTeachers.length}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-logout-btn">
                        🚪 Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {/* Top Bar */}
                <div className="admin-topbar">
                    <div>
                        <h1 className="topbar-title">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="topbar-sub">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={fetchAll} className="topbar-refresh-btn" title="Refresh data">
                        🔄 Refresh
                    </button>
                </div>

                {/* ── Overview Tab ── */}
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        {/* Stat Cards */}
                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.totalUsers}</div>
                                    <div className="stat-label">Total Users</div>
                                    <div className="stat-breakdown">
                                        <span>{studentCount} Students</span> · <span>{teacherCount} Teachers</span>
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card purple">
                                <div className="stat-icon">📚</div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.totalCourses}</div>
                                    <div className="stat-label">Total Courses</div>
                                    <div className="stat-breakdown">Active on platform</div>
                                </div>
                            </div>
                            <div className="stat-card green">
                                <div className="stat-icon">🎓</div>
                                <div className="stat-info">
                                    <div className="stat-number">{stats.totalEnrollments}</div>
                                    <div className="stat-label">Enrollments</div>
                                    <div className="stat-breakdown">Across all courses</div>
                                </div>
                            </div>
                            <div className="stat-card yellow">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <div className="stat-number">₹{stats.totalRevenue.toLocaleString()}</div>
                                    <div className="stat-label">Total Revenue</div>
                                    <div className="stat-breakdown">From paid courses</div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Approvals Banner */}
                        {pendingTeachers.length > 0 && (
                            <div className="pending-banner">
                                <span className="pending-banner-icon">⏳</span>
                                <div>
                                    <strong>{pendingTeachers.length} teacher {pendingTeachers.length === 1 ? 'application' : 'applications'} pending approval</strong>
                                    <p>Review and approve or reject teacher registrations.</p>
                                </div>
                                <button onClick={() => setActiveTab('teachers')} className="pending-banner-btn">
                                    Review Now →
                                </button>
                            </div>
                        )}

                        {/* Recent Activity */}
                        <div className="overview-grid">
                            <div className="overview-card">
                                <div className="overview-card-header">
                                    <h3>Recent Users</h3>
                                    <button onClick={() => setActiveTab('users')} className="see-all-btn">See all →</button>
                                </div>
                                <div className="overview-list">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u._id} className="overview-list-item">
                                            <div className="overview-avatar">{u.name[0]}</div>
                                            <div className="overview-item-info">
                                                <span className="overview-item-name">{u.name}</span>
                                                <span className="overview-item-email">{u.email}</span>
                                            </div>
                                            <span className={`role-badge ${u.type}`}>{u.type}</span>
                                        </div>
                                    ))}
                                    {users.length === 0 && <p className="empty-msg">No users found</p>}
                                </div>
                            </div>

                            <div className="overview-card">
                                <div className="overview-card-header">
                                    <h3>Recent Enrollments</h3>
                                    <button onClick={() => setActiveTab('enrollments')} className="see-all-btn">See all →</button>
                                </div>
                                <div className="overview-list">
                                    {enrollments.slice(0, 5).map(e => (
                                        <div key={e._id} className="overview-list-item">
                                            <div className="overview-avatar enroll">{e.studentId?.name?.[0] || '?'}</div>
                                            <div className="overview-item-info">
                                                <span className="overview-item-name">{e.studentId?.name || 'Unknown'}</span>
                                                <span className="overview-item-email">{e.courseId?.C_title || 'Unknown course'}</span>
                                            </div>
                                            <span className={`status-badge ${e.isPaid ? 'paid' : 'free'}`}>
                                                {e.isPaid ? 'Paid' : 'Free'}
                                            </span>
                                        </div>
                                    ))}
                                    {enrollments.length === 0 && <p className="empty-msg">No enrollments yet</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Users Tab ── */}
                {activeTab === 'users' && (
                    <div className="tab-content">
                        <div className="table-toolbar">
                            <div className="search-box">
                                <span>🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchUser}
                                    onChange={e => setSearchUser(e.target.value)}
                                    id="search-users"
                                />
                            </div>
                            <div className="toolbar-info">
                                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                            </div>
                        </div>

                        <div className="data-table-card">
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Date of Birth</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Registered</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, i) => (
                                            <tr key={u._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-user">
                                                        <div className="td-avatar">{u.name[0]}</div>
                                                        <strong>{u.name}</strong>
                                                    </div>
                                                </td>
                                                <td className="td-email">{u.email}</td>
                                                <td style={{ fontSize: '0.85rem' }}>{u.phone || <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}</td>
                                                <td style={{ fontSize: '0.85rem' }}>{u.dob ? new Date(u.dob).toLocaleDateString('en-IN') : <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>}</td>
                                                <td><span className={`role-badge ${u.type}`}>{u.type}</span></td>
                                                <td>
                                                    <span className={`status-badge ${u.isApproved ? 'approved' : 'pending'}`}>
                                                        {u.type === 'teacher' ? (u.isApproved ? '✓ Approved' : '⏳ Pending') : '✓ Active'}
                                                    </span>
                                                </td>
                                                <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="btn-delete"
                                                        id={`delete-user-${u._id}`}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="empty-table">No users found matching &quot;{searchUser}&quot;</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Teacher Approvals Tab ── */}
                {activeTab === 'teachers' && (
                    <div className="tab-content">
                        {pendingTeachers.length > 0 ? (
                            <>
                                <div className="approval-header">
                                    <div className="approval-count-badge">{pendingTeachers.length} Pending</div>
                                    <p>These teacher accounts are waiting for your approval before they can log in and create courses.</p>
                                </div>
                                <div className="approval-grid">
                                    {pendingTeachers.map(t => (
                                        <div key={t._id} className="approval-card">
                                            <div className="approval-card-top">
                                                <div className="approval-avatar">{t.name[0]}</div>
                                                <div className="approval-info">
                                                    <h3>{t.name}</h3>
                                                    <p>{t.email}</p>
                                                    <span className="approval-date">
                                                        Applied: {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <span className="approval-role-badge teacher">Teacher</span>
                                            </div>
                                            <div className="approval-card-actions">
                                                <button
                                                    onClick={() => handleApproveTeacher(t._id)}
                                                    className="btn-approve"
                                                    id={`approve-${t._id}`}
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectTeacher(t._id)}
                                                    className="btn-reject"
                                                    id={`reject-${t._id}`}
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">✅</div>
                                <h3>All caught up!</h3>
                                <p>No pending teacher approvals at this time.</p>
                            </div>
                        )}

                        {/* Approved teachers section */}
                        <div className="data-table-card" style={{ marginTop: '2rem' }}>
                            <div className="data-table-title">
                                <h2>✅ Approved Teachers ({users.filter(u => u.type === 'teacher' && u.isApproved).length})</h2>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Approved On</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(u => u.type === 'teacher' && u.isApproved).map((t, i) => (
                                            <tr key={t._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-user">
                                                        <div className="td-avatar teacher-av">{t.name[0]}</div>
                                                        <strong>{t.name}</strong>
                                                    </div>
                                                </td>
                                                <td className="td-email">{t.email}</td>
                                                <td>{new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td>
                                                    <button onClick={() => handleDeleteUser(t._id)} className="btn-delete">
                                                        🗑️ Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.filter(u => u.type === 'teacher' && u.isApproved).length === 0 && (
                                    <div className="empty-table">No approved teachers yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Enrollments Tab ── */}
                {activeTab === 'enrollments' && (
                    <div className="tab-content">
                        <div className="data-table-card">
                            <div className="data-table-title">
                                <h2>All Enrollments ({enrollments.length})</h2>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Payment</th>
                                            <th>Progress</th>
                                            <th>Enrolled</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((e, i) => (
                                            <tr key={e._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-user">
                                                        <div className="td-avatar student-av">{e.studentId?.name?.[0] || '?'}</div>
                                                        <div>
                                                            <div><strong>{e.studentId?.name || 'Unknown'}</strong></div>
                                                            <div className="td-sub">{e.studentId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="td-course">{e.courseId?.C_title || 'Deleted Course'}</td>
                                                <td>
                                                    <span className={`status-badge ${e.isPaid ? 'paid' : 'free'}`}>
                                                        {e.isPaid ? '💳 Paid' : '🆓 Free'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="progress-cell">
                                                        <div className="progress-bar">
                                                            <div className="progress-fill" style={{ width: `${e.progress || 0}%` }}></div>
                                                        </div>
                                                        <span>{e.progress || 0}%</span>
                                                    </div>
                                                </td>
                                                <td>{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {enrollments.length === 0 && (
                                    <div className="empty-table">No enrollments found</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Courses Tab ── */}
                {activeTab === 'courses' && (
                    <div className="tab-content">
                        <div className="data-table-card">
                            <div className="data-table-title">
                                <h2>All Courses ({courses.length})</h2>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Educator</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Enrolled</th>
                                            <th>Sections</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.map((c, i) => (
                                            <tr key={c._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-course-title">
                                                        {c.thumbnail ? (
                                                            <img src={`${BACKEND_URL}${c.thumbnail}`} alt={c.C_title} className="course-thumb" />
                                                        ) : (
                                                            <div className="course-thumb-placeholder">📚</div>
                                                        )}
                                                        <strong>{c.C_title}</strong>
                                                    </div>
                                                </td>
                                                <td>{c.userID?.name || c.C_educator}</td>
                                                <td><span className="category-badge">{c.C_categories}</span></td>
                                                <td>{c.C_price === 0 ? <span className="free-badge">Free</span> : `₹${c.C_price}`}</td>
                                                <td>{c.enrolled?.length || 0}</td>
                                                <td>{c.sections?.length || 0}</td>
                                                <td>
                                                    <button
                                                        onClick={async () => {
                                                            if (!window.confirm('Delete this course as Admin? This cannot be undone.')) return;
                                                            try {
                                                                await axiosInstance.delete(`/api/admin/courses/${c._id}`);
                                                                toast.success('Course deleted');
                                                                fetchAll();
                                                            } catch {
                                                                toast.error('Failed to delete course');
                                                            }
                                                        }}
                                                        className="btn-delete"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {courses.length === 0 && (
                                    <div className="empty-table">No courses found</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Live Sessions Tab ── */}
                {activeTab === 'live-sessions' && (
                    <div className="tab-content">
                        <div className="data-table-card">
                            <div className="data-table-title">
                                <h2>🔴 Platform Live Sessions ({liveSessions.length})</h2>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Teacher</th>
                                            <th>Course</th>
                                            <th>Session Title</th>
                                            <th>Scheduled For</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {liveSessions.map((session, i) => (
                                            <tr key={session._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-user">
                                                        <div className="td-avatar">{session.teacherId?.name?.[0] || '?'}</div>
                                                        <div>
                                                            <strong>{session.teacherId?.name || 'Unknown'}</strong>
                                                            <div className="td-sub">{session.teacherId?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="td-course">{session.courseId?.C_title}</td>
                                                <td><strong>{session.title}</strong></td>
                                                <td>{new Date(session.scheduledAt).toLocaleString('en-IN')}</td>
                                                <td>
                                                    <span className={`status-badge ${session.isLive ? 'paid' : 'pending'}`}>
                                                        {session.isLive ? '🔴 LIVE NOW' : 'Scheduled'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {session.isLive ? (
                                                        <a href={session.sessionUrl} target="_blank" rel="noreferrer" className="btn-approve" style={{ textDecoration: 'none' }}>
                                                            Join Stream
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Waiting...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {liveSessions.length === 0 && (
                                    <div className="empty-table">No live sessions on the platform</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Payments Tab ── */}
                {activeTab === 'payments' && (
                    <div className="tab-content">
                        <div className="data-table-card">
                            <div className="data-table-title">
                                <h2>💳 Payment Records ({payments.length})</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>
                                    Pending payments must be approved before students get course access
                                </p>
                            </div>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Transaction ID</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p, i) => (
                                            <tr key={p._id}>
                                                <td className="td-num">{i + 1}</td>
                                                <td>
                                                    <div className="td-user">
                                                        <div className="td-avatar student-av">{p.studentId?.name?.[0] || '?'}</div>
                                                        <div>
                                                            <div><strong>{p.studentId?.name || 'Unknown'}</strong></div>
                                                            <div className="td-sub">{p.studentId?.email || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="td-course">{p.courseId?.C_title || 'Deleted Course'}</td>
                                                <td><strong>₹{p.amount}</strong></td>
                                                <td>
                                                    <span className={`status-badge ${p.status === 'completed' ? 'paid' : p.status === 'failed' ? 'rejected' : 'pending'}`}>
                                                        {p.status === 'completed' ? '✅ Approved' : p.status === 'failed' ? '❌ Rejected' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                                                    {p.transactionId}
                                                </td>
                                                <td>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td>
                                                    {p.status === 'pending' ? (
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!window.confirm(`Approve payment of ₹${p.amount} from ${p.studentId?.name}?`)) return;
                                                                    try {
                                                                        await axiosInstance.put(`/api/admin/payments/${p._id}/approve`);
                                                                        toast.success('Payment approved! Student now has access.');
                                                                        fetchAll();
                                                                    } catch { toast.error('Approval failed'); }
                                                                }}
                                                                className="btn-approve"
                                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                            >
                                                                ✅ Approve
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!window.confirm('Reject this payment? Student will need to resubmit.')) return;
                                                                    try {
                                                                        await axiosInstance.delete(`/api/admin/payments/${p._id}/reject`);
                                                                        toast.success('Payment rejected.');
                                                                        fetchAll();
                                                                    } catch { toast.error('Rejection failed'); }
                                                                }}
                                                                className="btn-delete"
                                                                style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                            >
                                                                ❌ Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {payments.length === 0 && (
                                    <div className="empty-table">No payment records yet</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Settings Tab ── */}
                {activeTab === 'settings' && (
                    <div className="tab-content">
                        <div className="data-table-card" style={{ maxWidth: '520px' }}>
                            <div className="data-table-title">
                                <h2>📱 UPI Payment QR Code</h2>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {qrImage && (
                                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>Current QR Code:</p>
                                        <img
                                            src={`${BACKEND_URL}${qrImage}`}
                                            alt="Current UPI QR"
                                            style={{ width: '180px', height: '180px', borderRadius: '12px', border: '3px solid rgba(0,210,255,0.35)' }}
                                        />
                                    </div>
                                )}
                                {!qrImage && (
                                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                                        <span style={{ fontSize: '3rem' }}>📷</span>
                                        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>No QR code uploaded yet</p>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                                        Upload New QR Code Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setQrFile(e.target.files[0])}
                                        style={{ color: 'white', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px' }}
                                    />
                                    {qrFile && (
                                        <p style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Selected: {qrFile.name}</p>
                                    )}
                                    <button
                                        onClick={handleQrUpload}
                                        disabled={qrUploading || !qrFile}
                                        className="btn-approve"
                                        style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                                    >
                                        {qrUploading ? '⏳ Uploading…' : '⬆️ Upload QR Code'}
                                    </button>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                        This QR code will be shown to students when they make a payment. Upload a UPI QR code generated from your bank or payment app.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
