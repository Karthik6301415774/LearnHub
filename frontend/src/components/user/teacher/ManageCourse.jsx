import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../common/AxiosInstance';
import { toast } from 'react-toastify';
import './ManageCourse.css';

export default function ManageCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [sectionForm, setSectionForm] = useState({ title: '', description: '', duration: '' });
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/users/courses/${courseId}`);
            setCourse(data);
        } catch (err) {
            toast.error('Failed to fetch course');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            const fd = new FormData();
            fd.append('title', sectionForm.title);
            fd.append('description', sectionForm.description);
            fd.append('duration', sectionForm.duration);
            if (video) fd.append('video', video);
            const { data } = await axiosInstance.post(`/api/admin/courses/${courseId}/sections`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCourse(data);
            setSectionForm({ title: '', description: '', duration: '' });
            setVideo(null);
            setShowForm(false);
            toast.success('Section added!');
        } catch (err) {
            toast.error('Failed to add section');
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!window.confirm('Delete this section?')) return;
        try {
            const { data } = await axiosInstance.delete(`/api/admin/courses/${courseId}/sections/${sectionId}`);
            setCourse(data);
            toast.success('Section deleted');
        } catch (err) {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div className="mc-loading">⟳ Loading...</div>;
    if (!course) return <div className="mc-loading">Course not found</div>;

    return (
        <div className="manage-course-page">
            <div className="mc-header">
                <button onClick={() => navigate('/teacher')} className="btn-back">← Back</button>
                <div>
                    <h1>{course.C_title}</h1>
                    <p>{course.C_categories} • {course.C_price === 0 ? 'Free' : `₹${course.C_price}`} • {course.enrolled.length} students</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary-pill">
                    {showForm ? '✕ Cancel' : '+ Add Lesson'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAddSection} className="add-section-form">
                    <h3>Add New Lesson</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Lesson Title *</label>
                            <input
                                value={sectionForm.title}
                                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                                placeholder="e.g. Introduction to React"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                value={sectionForm.duration}
                                onChange={(e) => setSectionForm({ ...sectionForm, duration: e.target.value })}
                                placeholder="e.g. 12:30"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={sectionForm.description}
                            onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                            placeholder="What will students learn in this lesson?"
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Upload Video</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideo(e.target.files[0])}
                            className="file-input"
                        />
                        {video && <span className="file-name">📹 {video.name}</span>}
                    </div>
                    <button type="submit" className="btn-primary" disabled={adding}>
                        {adding ? 'Uploading...' : 'Add Lesson'}
                    </button>
                </form>
            )}

            <div className="mc-sections">
                <h2>📋 Course Curriculum ({course.sections.length} lessons)</h2>
                {course.sections.length === 0 ? (
                    <div className="mc-empty">
                        <span>📹</span>
                        <p>No lessons yet. Add your first lesson above.</p>
                    </div>
                ) : (
                    <div className="mc-section-list">
                        {course.sections.map((s, i) => (
                            <div key={s._id} className="mc-section-item">
                                <div className="mc-section-left">
                                    <span className="mc-num">{i + 1}</span>
                                    <div>
                                        <div className="mc-section-title">{s.title}</div>
                                        {s.description && <div className="mc-section-desc">{s.description}</div>}
                                        <div className="mc-section-meta">
                                            {s.duration && <span>⏱ {s.duration}</span>}
                                            {s.videoUrl ? (
                                                <span className="has-video">✅ Video uploaded</span>
                                            ) : (
                                                <span className="no-video">⚠️ No video</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteSection(s._id)} className="btn-del-section">🗑️</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
