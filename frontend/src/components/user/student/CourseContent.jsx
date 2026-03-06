import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance, { BACKEND_URL } from '../../common/AxiosInstance';
// removed useAuth import
import { toast } from 'react-toastify';
import './CourseContent.css';

export default function CourseContent() {
    const { courseId } = useParams();
    // useAuth no longer extracted
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const [extras, setExtras] = useState({ liveSessions: [], quizzes: [], practices: [] });
    const [activeTab, setActiveTab] = useState('section'); // 'section' or 'extras'
    const [videoCompleted, setVideoCompleted] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, myCoursesRes, extrasRes] = await Promise.all([
                axiosInstance.get(`/api/users/courses/${courseId}`),
                axiosInstance.get('/api/users/my-courses'),
                axiosInstance.get(`/api/users/courses/${courseId}/extras`),
            ]);
            setCourse(courseRes.data);
            setExtras(extrasRes.data);
            const enroll = myCoursesRes.data.find((e) => e.courseId?._id === courseId);
            if (enroll) {
                setEnrollment(enroll);
                setCurrentSection(enroll.lastSectionIndex || 0);
            }
        } catch {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const markComplete = async () => {
        try {
            const { data } = await axiosInstance.put(`/api/users/progress/${courseId}`, {
                sectionIndex: currentSection,
                completed: true,
            });
            setEnrollment(data);
            toast.success('Section marked complete!');
            setVideoCompleted(false); // Reset for next section
            if (currentSection < course.sections.length - 1) {
                setCurrentSection((prev) => prev + 1);
            }
        } catch {
            toast.error('Failed to update progress');
        }
    };

    const handleTimeUpdate = (e) => {
        const video = e.target;
        if (!video.duration) return;
        const progress = (video.currentTime / video.duration) * 100;
        if (progress >= 70 && !videoCompleted) {
            setVideoCompleted(true);
        }
    };

    // Reset video completion state when changing sections
    useEffect(() => {
        setVideoCompleted(false);
    }, [currentSection]);

    if (loading) return <div className="cc-loading">⟳ Loading course...</div>;
    if (!course) return <div className="cc-loading">Course not found</div>;
    if (!enrollment) return (
        <div className="cc-loading">
            <p>You are not enrolled in this course.</p>
            <button onClick={() => navigate('/courses')} className="btn-back">Go to Courses</button>
        </div>
    );

    if (course.C_price > 0 && !enrollment.isPaid) {
        return (
            <div className="cc-loading">
                <p>Please complete payment to access this course.</p>
                <button onClick={() => navigate('/student')} className="btn-back">Go to Dashboard</button>
            </div>
        );
    }

    const section = course.sections[currentSection];
    const isCompleted = enrollment.completedSections?.some(
        (id) => id === section?._id || id?.toString() === section?._id?.toString()
    );

    return (
        <div className="course-content-page">
            {/* Sidebar */}
            <aside className="cc-sidebar">
                <div className="cc-sidebar-header">
                    <button onClick={() => navigate('/student')} className="btn-back-small">← Back</button>
                    <h3>{course.C_title}</h3>
                    <div className="progress-info">
                        <div className="cc-progress-bar">
                            <div className="cc-progress-fill" style={{ width: `${enrollment.progress}%` }}></div>
                        </div>
                        <span>{enrollment.progress}% complete</span>
                    </div>
                </div>
                <div className="cc-sections-list">
                    {course.sections.map((s, i) => {
                        const done = enrollment.completedSections?.some(
                            (id) => id === s._id || id?.toString() === s._id?.toString()
                        );
                        return (
                            <button
                                key={i}
                                className={`cc-section-btn ${i === currentSection && activeTab === 'section' ? 'active' : ''} ${done ? 'done' : ''}`}
                                onClick={() => { setActiveTab('section'); setCurrentSection(i); }}
                            >
                                <span className="section-num">{done ? '✓' : i + 1}</span>
                                <span className="section-title">{s.title}</span>
                            </button>
                        );
                    })}

                    <hr style={{ margin: '15px 0', borderColor: 'rgba(255,255,255,0.1)' }} />

                    <button
                        className={`cc-section-btn ${activeTab === 'extras' ? 'active' : ''}`}
                        onClick={() => setActiveTab('extras')}
                        style={{ background: activeTab === 'extras' ? 'rgba(79, 70, 229, 0.3)' : 'transparent' }}
                    >
                        <span className="section-num">🌟</span>
                        <span className="section-title">Extras (Quiz, Practice, Live)</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="cc-main">
                {activeTab === 'extras' ? (
                    <div style={{ padding: '2rem' }}>
                        <h2>Course Extras</h2>

                        {/* Live Sessions */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#f87171', marginBottom: '1rem' }}>🔴 Live Sessions</h3>
                            {extras.liveSessions.length === 0 ? <p style={{ color: 'gray' }}>No live sessions scheduled.</p> : extras.liveSessions.map(ls => (
                                <div key={ls._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{ls.title}</strong>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>📅 {new Date(ls.scheduledAt).toLocaleString()}</div>
                                    </div>
                                    {ls.isLive ? (
                                        <a href={ls.sessionUrl} target="_blank" rel="noreferrer" className="btn-approve" style={{ textDecoration: 'none', background: '#ef4444' }}>Join Live Stream</a>
                                    ) : (
                                        <span style={{ color: 'gray' }}>Waiting for Host</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Quizzes */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#a78bfa', marginBottom: '1rem' }}>🧠 Quizzes</h3>
                            {extras.quizzes.length === 0 ? <p style={{ color: 'gray' }}>No quizzes available.</p> : extras.quizzes.map(q => (
                                <div key={q._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '10px' }}>
                                    <strong>{q.title}</strong>
                                    <p style={{ fontSize: '0.9rem', margin: '5px 0' }}>{q.description}</p>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{q.questions.length} Questions</div>
                                </div>
                            ))}
                        </div>

                        {/* Practice Sessions */}
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#60a5fa', marginBottom: '1rem' }}>📝 Practice / Assignments</h3>
                            {extras.practices.length === 0 ? <p style={{ color: 'gray' }}>No practice tasks available.</p> : extras.practices.map(p => (
                                <div key={p._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '10px' }}>
                                    <strong>{p.title}</strong>
                                    <p style={{ fontSize: '0.9rem', margin: '5px 0', whiteSpace: 'pre-wrap' }}>{p.description}</p>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Submission Type: <span style={{ textTransform: 'uppercase' }}>{p.submissionType}</span>
                                        {p.dueDate && ` | Due: ${new Date(p.dueDate).toLocaleDateString()}`}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ) : section ? (
                    <>
                        <h2 className="cc-section-title">{section.title}</h2>
                        {section.videoUrl ? (
                            <>
                                <div className="cc-video-wrap">
                                    <video
                                        key={section.videoUrl}
                                        controls
                                        className="cc-video"
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={markComplete}
                                    >
                                        <source src={`${BACKEND_URL}${section.videoUrl}`} />
                                        Your browser does not support video.
                                    </video>
                                </div>
                                {!isCompleted && !videoCompleted && (
                                    <div style={{ textAlign: 'center', marginTop: '10px', color: '#f59e0b', fontSize: '0.9rem', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '6px' }}>
                                        ⚠️ You must watch at least 70% of the video to mark it as complete.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="cc-no-video">📄 No video for this lesson</div>
                        )}
                        {section.description && (
                            <div className="cc-description">
                                <h4>About this lesson</h4>
                                <p>{section.description}</p>
                            </div>
                        )}
                        <div className="cc-actions">
                            {!isCompleted && (
                                <button
                                    onClick={markComplete}
                                    className="btn-complete"
                                    disabled={section.videoUrl && !videoCompleted}
                                    style={{ opacity: (section.videoUrl && !videoCompleted) ? 0.4 : 1, cursor: (section.videoUrl && !videoCompleted) ? 'not-allowed' : 'pointer' }}
                                >
                                    ✓ Mark as Complete
                                </button>
                            )}
                            {currentSection > 0 && (
                                <button onClick={() => setCurrentSection((p) => p - 1)} className="btn-nav">← Prev</button>
                            )}
                            {currentSection < course.sections.length - 1 && (
                                <button
                                    onClick={() => setCurrentSection((p) => p + 1)}
                                    className="btn-nav"
                                    disabled={!isCompleted && section.videoUrl && !videoCompleted}
                                    style={{ opacity: (!isCompleted && section.videoUrl && !videoCompleted) ? 0.4 : 1, cursor: (!isCompleted && section.videoUrl && !videoCompleted) ? 'not-allowed' : 'pointer' }}
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="cc-no-video">No sections available yet.</div>
                )}
            </main>
        </div>
    );
}
