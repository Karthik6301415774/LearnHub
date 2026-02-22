import { useState } from 'react';
import axiosInstance from '../../common/AxiosInstance';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import './AddCourse.css';

const CATEGORIES = [
    'Web Development', 'Data Science', 'AI & ML', 'UI/UX Design',
    'Mobile Dev', 'Cloud Computing', 'Cybersecurity', 'Databases'
];

export default function AddCourse({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        C_educator: user?.name || '',
        C_categories: '',
        C_title: '',
        C_description: '',
        C_price: 0,
        prerequisites: '',
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (thumbnail) fd.append('thumbnail', thumbnail);
            await axiosInstance.post('/api/admin/courses', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Course created successfully!');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>➕ Add New Course</h2>
                    <button onClick={onClose} className="modal-close">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="add-course-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Course Title *</label>
                            <input name="C_title" placeholder="e.g. Full Stack React & Node" value={form.C_title} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Educator Name</label>
                            <input name="C_educator" placeholder="Your name" value={form.C_educator} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select name="C_categories" value={form.C_categories} onChange={handleChange} required>
                                <option value="">Select category</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Price (₹) — 0 for Free</label>
                            <input type="number" name="C_price" min="0" value={form.C_price} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description *</label>
                        <textarea name="C_description" rows={4} placeholder="Describe your course..." value={form.C_description} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Prerequisites</label>
                        <input name="prerequisites" placeholder="e.g. Basic HTML, JavaScript" value={form.prerequisites} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Course Thumbnail</label>
                        <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} className="file-input" />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
