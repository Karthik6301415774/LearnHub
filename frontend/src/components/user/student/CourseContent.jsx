import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../common/AxiosInstance';
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

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [courseRes, myCoursesRes] = await Promise.all([
                axiosInstance.get(`/api/users/courses/${courseId}`),
                axiosInstance.get('/api/users/my-courses'),
            ]);
            setCourse(courseRes.data);
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
            if (currentSection < course.sections.length - 1) {
                setCurrentSection((prev) => prev + 1);
            }
        } catch {
            toast.error('Failed to update progress');
        }
    };

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
                                className={`cc-section-btn ${i === currentSection ? 'active' : ''} ${done ? 'done' : ''}`}
                                onClick={() => setCurrentSection(i)}
                            >
                                <span className="section-num">{done ? '✓' : i + 1}</span>
                                <span className="section-title">{s.title}</span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className="cc-main">
                {section ? (
                    <>
                        <h2 className="cc-section-title">{section.title}</h2>
                        {section.videoUrl ? (
                            <div className="cc-video-wrap">
                                <video
                                    key={section.videoUrl}
                                    controls
                                    className="cc-video"
                                    onEnded={markComplete}
                                >
                                    <source src={`http://localhost:5000${section.videoUrl}`} />
                                    Your browser does not support video.
                                </video>
                            </div>
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
                                <button onClick={markComplete} className="btn-complete">✓ Mark as Complete</button>
                            )}
                            {currentSection > 0 && (
                                <button onClick={() => setCurrentSection((p) => p - 1)} className="btn-nav">← Prev</button>
                            )}
                            {currentSection < course.sections.length - 1 && (
                                <button onClick={() => setCurrentSection((p) => p + 1)} className="btn-nav">Next →</button>
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
