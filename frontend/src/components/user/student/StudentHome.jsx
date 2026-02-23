import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../common/AxiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import './Student.css';

export default function StudentHome() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const { data } = await axiosInstance.get('/api/users/my-courses');
            setEnrollments(data);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const inProgress = enrollments.filter((e) => e.progress < 100);
    const completed = enrollments.filter((e) => e.progress >= 100);

    return (
        <div className="student-page">
            <div className="page-header">
                <div>
                    <h1>👋 Welcome back, {user?.name}!</h1>
                    <p>Continue your learning journey</p>
                </div>
                <Link to="/courses" className="btn-primary-pill">+ Explore Courses</Link>
            </div>

            <div className="student-stats">
                <div className="s-stat-card">
                    <div className="s-stat-num">{enrollments.length}</div>
                    <div className="s-stat-label">Enrolled</div>
                </div>
                <div className="s-stat-card">
                    <div className="s-stat-num">{inProgress.length}</div>
                    <div className="s-stat-label">In Progress</div>
                </div>
                <div className="s-stat-card green">
                    <div className="s-stat-num">{completed.length}</div>
                    <div className="s-stat-label">Completed</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-spinner">⟳ Loading...</div>
            ) : (
                <>
                    {inProgress.length > 0 && (
                        <section className="enrollment-section">
                            <h2>📚 In Progress</h2>
                            <div className="enrollment-grid">
                                {inProgress.map((e) => (
                                    <EnrollmentCard key={e._id} enrollment={e} onPaid={fetchEnrollments} />
                                ))}
                            </div>
                        </section>
                    )}
                    {completed.length > 0 && (
                        <section className="enrollment-section">
                            <h2>🏆 Completed</h2>
                            <div className="enrollment-grid">
                                {completed.map((e) => (
                                    <EnrollmentCard key={e._id} enrollment={e} completed onPaid={fetchEnrollments} />
                                ))}
                            </div>
                        </section>
                    )}
                    {enrollments.length === 0 && (
                        <div className="empty-state">
                            <span>📖</span>
                            <h3>No courses yet</h3>
                            <p>Start learning by enrolling in a course</p>
                            <Link to="/courses" className="btn-primary-pill">Browse Courses</Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function EnrollmentCard({ enrollment, completed, onPaid }) {
    const course = enrollment.courseId;
    const navigate = useNavigate();

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/api/users/pay/${course._id}`);
            toast.success('Payment successful! You can now access the course.');
            onPaid();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        }
    };

    if (!course) return null;

    return (
        <div className="enrollment-card">
            <div className="enrollment-thumb">
                {course.thumbnail ? (
                    <img src={`http://localhost:5000${course.thumbnail}`} alt={course.C_title} />
                ) : (
                    <div className="thumb-placeholder">🎓</div>
                )}
                {completed && <div className="completed-badge">✓ Completed</div>}
            </div>
            <div className="enrollment-content">
                <span className="cat-tag">{course.C_categories}</span>
                <h3>{course.C_title}</h3>
                <p>by {course.C_educator}</p>
                <div className="progress-bar-wrap">
                    <div className="progress-bar-fill" style={{ width: `${enrollment.progress}%` }}></div>
                </div>
                <span className="progress-text">{enrollment.progress}% complete</span>
                <div className="enrollment-actions">
                    {course.C_price > 0 && !enrollment.isPaid ? (
                        <button className="btn-pay" onClick={handlePay}>💳 Pay ₹{course.C_price}</button>
                    ) : completed ? (
                        <button className="btn-certificate" onClick={() => navigate(`/certificate/${course._id}`)}>
                            📜 Download Certificate
                        </button>
                    ) : (
                        <button className="btn-resume" onClick={() => navigate(`/course/${course._id}`)}>
                            ▶ {enrollment.progress > 0 ? 'Resume' : 'Start'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
