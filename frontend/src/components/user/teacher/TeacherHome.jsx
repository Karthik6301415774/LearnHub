import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../common/AxiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import AddCourse from './AddCourse';
import './Teacher.css';

export default function TeacherHome() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddCourse, setShowAddCourse] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await axiosInstance.get('/api/admin/my-courses');
            setCourses(data);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courseId, enrolled) => {
        if (enrolled > 0) {
            toast.error('Cannot delete: students are enrolled in this course');
            return;
        }
        if (!window.confirm('Delete this course?')) return;
        try {
            await axiosInstance.delete(`/api/admin/courses/${courseId}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const totalStudents = courses.reduce((sum, c) => sum + c.enrolled.length, 0);

    return (
        <div className="teacher-page">
            <div className="page-header">
                <div>
                    <h1>📋 Teacher Dashboard</h1>
                    <p>Welcome, {user?.name}! Manage your courses.</p>
                </div>
                <button onClick={() => setShowAddCourse(true)} className="btn-primary-pill">
                    + Add Course
                </button>
            </div>

            <div className="teacher-stats">
                <div className="t-stat">
                    <div className="t-stat-num">{courses.length}</div>
                    <div className="t-stat-label">Courses Created</div>
                </div>
                <div className="t-stat">
                    <div className="t-stat-num">{totalStudents}</div>
                    <div className="t-stat-label">Total Students</div>
                </div>
            </div>

            {showAddCourse && (
                <AddCourse
                    onClose={() => setShowAddCourse(false)}
                    onSuccess={() => { setShowAddCourse(false); fetchCourses(); }}
                />
            )}

            <div className="teacher-courses">
                <h2>Your Courses</h2>
                {loading ? (
                    <div className="loading-text">Loading...</div>
                ) : courses.length === 0 ? (
                    <div className="empty-courses">
                        <span>📚</span>
                        <h3>No courses yet</h3>
                        <p>Click "Add Course" to create your first course</p>
                    </div>
                ) : (
                    <div className="teacher-course-grid">
                        {courses.map((course) => (
                            <div key={course._id} className="teacher-course-card">
                                <div className="tc-thumb">
                                    {course.thumbnail ? (
                                        <img src={`http://localhost:5000${course.thumbnail}`} alt={course.C_title} />
                                    ) : (
                                        <div className="tc-placeholder">🎓</div>
                                    )}
                                    <span className="tc-price-badge">
                                        {course.C_price === 0 ? 'FREE' : `₹${course.C_price}`}
                                    </span>
                                </div>
                                <div className="tc-info">
                                    <span className="tc-cat">{course.C_categories}</span>
                                    <h3>{course.C_title}</h3>
                                    <div className="tc-meta">
                                        <span>📹 {course.sections.length} sections</span>
                                        <span>👥 {course.enrolled.length} enrolled</span>
                                    </div>
                                </div>
                                <div className="tc-actions">
                                    <Link to={`/teacher/course/${course._id}`} className="btn-manage">
                                        ⚙️ Manage
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course._id, course.enrolled.length)}
                                        className="btn-delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
