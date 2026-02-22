import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from './AxiosInstance';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './CourseDetail.css';

export default function CourseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/users/courses/${id}`);
            setCourse(data);
            if (user) {
                const myCoursesRes = await axiosInstance.get('/api/users/my-courses');
                const found = myCoursesRes.data.find((e) => e.courseId?._id === id);
                setEnrolled(!!found);
            }
        } catch (err) {
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) { navigate('/login'); return; }
        setEnrollLoading(true);
        try {
            await axiosInstance.post(`/api/users/enroll/${id}`);
            toast.success('Enrolled successfully!');
            setEnrolled(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Enrollment failed');
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) return <div className="cd-loading">⟳ Loading...</div>;
    if (!course) return <div className="cd-loading">Course not found</div>;

    return (
        <div className="course-detail-page">
            {/* Hero */}
            <div className="cd-hero">
                <div className="cd-hero-content">
                    <span className="cd-category">{course.C_categories}</span>
                    <h1>{course.C_title}</h1>
                    <p className="cd-educator">👤 Instructor: <strong>{course.C_educator}</strong></p>
                    <p className="cd-desc">{course.C_description}</p>
                    <div className="cd-stats">
                        <span>📹 {course.sections.length} Lessons</span>
                        <span>👥 {course.enrolled.length} Students</span>
                        <span>💰 {course.C_price === 0 ? 'Free' : `₹${course.C_price}`}</span>
                    </div>
                </div>
                <div className="cd-enroll-card">
                    {course.thumbnail ? (
                        <img src={`http://localhost:5000${course.thumbnail}`} alt={course.C_title} className="cd-thumb" />
                    ) : (
                        <div className="cd-thumb-placeholder">🎓</div>
                    )}
                    <div className="cd-price">{course.C_price === 0 ? 'FREE' : `₹${course.C_price}`}</div>
                    {enrolled ? (
                        <button className="cd-btn-enrolled" onClick={() => navigate(`/course/${id}`)}>
                            ▶ Go to Course
                        </button>
                    ) : (
                        <button className="cd-btn-enroll" onClick={handleEnroll} disabled={enrollLoading}>
                            {enrollLoading ? '...' : course.C_price === 0 ? '🎉 Enroll for Free' : '🛒 Enroll Now'}
                        </button>
                    )}
                    {course.prerequisites && (
                        <div className="cd-prereq">
                            <strong>Prerequisites:</strong>
                            <p>{course.prerequisites}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sections */}
            <div className="cd-sections">
                <h2>Course Curriculum</h2>
                <p>{course.sections.length} lessons</p>
                <div className="cd-section-list">
                    {course.sections.length === 0 ? (
                        <p className="no-content">No lessons added yet.</p>
                    ) : (
                        course.sections.map((s, i) => (
                            <div key={i} className="cd-section-item">
                                <span className="cd-section-num">{i + 1}</span>
                                <div>
                                    <div className="cd-section-title">{s.title}</div>
                                    {s.duration && <div className="cd-section-dur">⏱ {s.duration}</div>}
                                </div>
                                <span className="cd-section-icon">{enrolled ? '▶' : '🔒'}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
