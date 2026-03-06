import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance, { BACKEND_URL } from '../../common/AxiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import './Student.css';

export default function StudentHome() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrImage, setQrImage] = useState(null);

    const fetchEnrollments = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/api/users/my-courses');
            setEnrollments(data);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchQr = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/api/admin/settings/upi-qr');
            setQrImage(data.imageUrl || null);
        } catch {
            setQrImage(null);
        }
    }, []);

    useEffect(() => {
        fetchEnrollments();
        fetchQr();
    }, [fetchEnrollments, fetchQr]);

    const inProgress = enrollments.filter((e) => !e.courseId?.C_price || e.isPaid || e.progress < 100);
    const completed = enrollments.filter((e) => e.progress >= 100);
    const unpaid = enrollments.filter((e) => e.courseId?.C_price > 0 && !e.isPaid);

    if (loading) {
        return (
            <div className="student-page">
                <div className="loading-screen">
                    <div className="loading-spinner-ring"></div>
                    <p>Loading your courses…</p>
                </div>
            </div>
        );
    }

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
                    <div className="s-stat-num">{unpaid.length}</div>
                    <div className="s-stat-label">Pending Payment</div>
                </div>
                <div className="s-stat-card green">
                    <div className="s-stat-num">{completed.length}</div>
                    <div className="s-stat-label">Completed</div>
                </div>
            </div>

            {unpaid.length > 0 && (
                <section className="enrollment-section">
                    <h2>💳 Payment Pending</h2>
                    <div className="enrollment-grid">
                        {unpaid.map((e) => (
                            <EnrollmentCard key={e._id} enrollment={e} onPaid={fetchEnrollments} qrImage={qrImage} />
                        ))}
                    </div>
                </section>
            )}

            {inProgress.filter(e => e.isPaid || !e.courseId?.C_price).length > 0 && (
                <section className="enrollment-section">
                    <h2>📚 In Progress</h2>
                    <div className="enrollment-grid">
                        {inProgress
                            .filter(e => e.isPaid || !e.courseId?.C_price)
                            .map((e) => (
                                <EnrollmentCard key={e._id} enrollment={e} onPaid={fetchEnrollments} qrImage={qrImage} />
                            ))}
                    </div>
                </section>
            )}

            {completed.length > 0 && (
                <section className="enrollment-section">
                    <h2>🏆 Completed</h2>
                    <div className="enrollment-grid">
                        {completed.map((e) => (
                            <EnrollmentCard key={e._id} enrollment={e} completed onPaid={fetchEnrollments} qrImage={qrImage} />
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
        </div>
    );
}

function EnrollmentCard({ enrollment, completed, onPaid, qrImage }) {
    const course = enrollment.courseId;
    const navigate = useNavigate();
    const [showQR, setShowQR] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handlePayClick = (e) => {
        e.preventDefault();
        setSubmitted(false);
        setTransactionId('');
        setShowQR(true);
    };

    const handleConfirmPayment = async () => {
        if (!transactionId.trim()) {
            toast.error('Please enter your UPI Transaction ID / UTR Number');
            return;
        }
        setIsPaying(true);
        try {
            const { data } = await axiosInstance.post(`/api/users/pay/${course._id}`, { transactionId });
            setSubmitted(true);
            toast.success(data.message || 'Payment submitted! Awaiting admin approval.');
            onPaid();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission failed');
        } finally {
            setIsPaying(false);
        }
    };

    if (!course) return null;

    const needsPayment = course.C_price > 0 && !enrollment.isPaid;
    const isPendingApproval = enrollment.paymentStatus === 'pending'; // set by backend

    return (
        <div className="enrollment-card">
            <div className="enrollment-thumb">
                {course.thumbnail ? (
                    <img src={`${BACKEND_URL}${course.thumbnail}`} alt={course.C_title} />
                ) : (
                    <div className="thumb-placeholder">🎓</div>
                )}
                {completed && <div className="completed-badge">✓ Completed</div>}
                {needsPayment && !isPendingApproval && <div className="unpaid-badge">💳 Payment Pending</div>}
                {needsPayment && isPendingApproval && <div className="unpaid-badge" style={{ background: 'rgba(245,158,11,0.9)' }}>⏳ Awaiting Approval</div>}
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
                    {needsPayment && isPendingApproval ? (
                        <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)' }}>
                            <div style={{ fontSize: '1.5rem' }}>⏳</div>
                            <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>Awaiting Admin Approval</div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Your payment is being verified</div>
                        </div>
                    ) : needsPayment ? (
                        <button className="btn-pay" onClick={handlePayClick}>💳 Pay ₹{course.C_price}</button>
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

            {/* QR Code Payment Modal */}
            {showQR && (
                <div className="modal-overlay" onClick={() => !isPaying && setShowQR(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h2>💳 Pay ₹{course.C_price}</h2>
                            <button onClick={() => !isPaying && setShowQR(false)} className="modal-close">✕</button>
                        </div>

                        {submitted ? (
                            <div style={{ padding: '30px 20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                                <h3 style={{ color: '#4ade80', marginBottom: '10px' }}>Payment Submitted!</h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                    Your payment is being reviewed by the admin. You will get access once it is approved.
                                </p>
                                <button onClick={() => setShowQR(false)} className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <div style={{ padding: '20px 0' }}>
                                    {qrImage ? (
                                        <img
                                            src={`${BACKEND_URL}${qrImage}`}
                                            alt="UPI Payment QR"
                                            style={{ width: '200px', height: '200px', borderRadius: '12px', border: '3px solid rgba(0,210,255,0.4)' }}
                                        />
                                    ) : (
                                        <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '10px' }}>
                                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                                ⚠️ No UPI QR code has been set by admin yet. Please contact support.
                                            </p>
                                        </div>
                                    )}
                                    <p style={{ marginTop: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                        Scan with any UPI app · Pay <strong>₹{course.C_price}</strong> for <strong>{course.C_title}</strong>
                                    </p>
                                </div>

                                <div style={{ padding: '0 20px 10px', textAlign: 'left' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: '#a78bfa', fontWeight: 600 }}>
                                        💬 Enter UPI Transaction ID / UTR Number
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={e => setTransactionId(e.target.value)}
                                        placeholder="e.g. 324512345678 or UPI/123456"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '5px' }}>
                                        This is required to verify your payment. Your access will be unlocked after admin verification.
                                    </p>
                                </div>

                                <div className="modal-actions" style={{ justifyContent: 'center', flexDirection: 'column', gap: '10px', padding: '0 20px 20px' }}>
                                    <button
                                        onClick={handleConfirmPayment}
                                        className="btn-primary"
                                        disabled={isPaying || !transactionId.trim()}
                                        style={{ width: '100%', padding: '12px', opacity: !transactionId.trim() ? 0.5 : 1 }}
                                    >
                                        {isPaying ? '⏳ Submitting…' : '📤 Submit Payment for Approval'}
                                    </button>
                                    <button
                                        onClick={() => setShowQR(false)}
                                        disabled={isPaying}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', borderRadius: '8px', padding: '8px', cursor: 'pointer', width: '100%' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
