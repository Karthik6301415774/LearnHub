import { useState, useEffect } from 'react';
import axiosInstance from '../common/AxiosInstance';
import { toast } from 'react-toastify';

export default function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Reusing the public endpoint for browsing, but showing table view
            const { data } = await axiosInstance.get('/api/users/courses');
            setCourses(data);
        } catch {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course as Admin? This action cannot be undone.')) return;
        try {
            await axiosInstance.delete(`/api/admin/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch {
            toast.error('Failed to delete course');
        }
    };

    if (loading) return <div className="admin-loading">Loading Courses...</div>;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>📚 All Courses</h1>
                <p>Global course management for Admin</p>
            </div>

            <div className="admin-table-card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Course Title</th>
                                <th>Educator</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Enrolled</th>
                                <th>Sections</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c._id}>
                                    <td><strong>{c.C_title}</strong></td>
                                    <td>{c.userID?.name || c.C_educator}</td>
                                    <td>{c.C_categories}</td>
                                    <td>{c.C_price === 0 ? 'Free' : `₹${c.C_price}`}</td>
                                    <td>{c.enrolled.length}</td>
                                    <td>{c.sections.length}</td>
                                    <td>
                                        <button onClick={() => handleDelete(c._id)} className="btn-table-del">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {courses.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                            No courses exist yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
