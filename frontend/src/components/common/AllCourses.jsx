import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from './AxiosInstance';
import './AllCourses.css';

export default function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const categories = ['Web Development', 'Data Science', 'AI & ML', 'UI/UX Design', 'Mobile Dev', 'Cloud Computing', 'Cybersecurity', 'Databases'];

    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, category]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (category) params.category = category;
            const { data } = await axiosInstance.get('/api/users/courses', { params });
            setCourses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="all-courses-page">
            <div className="courses-header">
                <h1>Explore Courses</h1>
                <p>Discover your next skill from our growing library</p>

                <div className="filter-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="🔍  Search courses..."
                        value={search}
                        onChange={(e) => setSearchParams({ search: e.target.value, category })}
                    />
                    <div className="category-filters">
                        <button
                            className={`filter-btn ${!category ? 'active' : ''}`}
                            onClick={() => setSearchParams({ search, category: '' })}
                        >
                            All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`filter-btn ${category === cat ? 'active' : ''}`}
                                onClick={() => setSearchParams({ search, category: cat })}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="courses-loading">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="course-skeleton" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="empty-state">
                    <span>📭</span>
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="courses-grid">
                    {courses.map((course) => (
                        <Link key={course._id} to={`/courses/${course._id}`} className="course-card">
                            <div className="course-thumbnail">
                                {course.thumbnail ? (
                                    <img src={`http://localhost:5000${course.thumbnail}`} alt={course.C_title} />
                                ) : (
                                    <div className="thumbnail-placeholder">
                                        <span>🎓</span>
                                    </div>
                                )}
                                <div className="course-price-badge">
                                    {course.C_price === 0 ? 'FREE' : `₹${course.C_price}`}
                                </div>
                            </div>
                            <div className="course-info">
                                <span className="course-category">{course.C_categories}</span>
                                <h3 className="course-title">{course.C_title}</h3>
                                <p className="course-educator">by {course.C_educator}</p>
                                <p className="course-desc">{course.C_description.slice(0, 80)}...</p>
                                <div className="course-meta">
                                    <span>📹 {course.sections.length} lessons</span>
                                    <span>👥 {course.enrolled.length} enrolled</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
