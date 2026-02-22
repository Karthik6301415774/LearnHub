import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const stats = [
    { value: '10,000+', label: 'Students Enrolled' },
    { value: '500+', label: 'Expert Courses' },
    { value: '200+', label: 'Skilled Instructors' },
    { value: '98%', label: 'Satisfaction Rate' },
];

const features = [
    { icon: '📹', title: 'Video Lessons', desc: 'High-quality video content for immersive learning experiences' },
    { icon: '📜', title: 'Certificates', desc: 'Earn verified certificates upon completing courses' },
    { icon: '💳', title: 'Easy Payments', desc: 'Enroll in free or paid courses with seamless checkout' },
    { icon: '⚡', title: 'Resume Anywhere', desc: 'Pause and resume your courses from where you left off' },
];

const categories = [
    { icon: '💻', name: 'Web Development' },
    { icon: '📊', name: 'Data Science' },
    { icon: '🤖', name: 'AI & ML' },
    { icon: '🎨', name: 'UI/UX Design' },
    { icon: '📱', name: 'Mobile Dev' },
    { icon: '☁️', name: 'Cloud Computing' },
    { icon: '🔐', name: 'Cybersecurity' },
    { icon: '🗄️', name: 'Databases' },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🚀 Start Learning Today</div>
                    <h1 className="hero-title">
                        Unlock Your <span className="gradient-text">Potential</span> with
                        Expert-Led Courses
                    </h1>
                    <p className="hero-subtitle">
                        Join thousands of learners mastering in-demand skills through structured video
                        courses, hands-on projects, and industry-recognized certificates.
                    </p>
                    <div className="hero-actions">
                        <Link to="/courses" className="btn-hero-primary">Browse Courses</Link>
                        {!user && (
                            <Link to="/register" className="btn-hero-secondary">Join Free</Link>
                        )}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card">
                        <div className="hero-card-header">
                            <span className="card-dot red"></span>
                            <span className="card-dot yellow"></span>
                            <span className="card-dot green"></span>
                        </div>
                        <div className="hero-card-body">
                            <div className="code-line"><span className="kw">const</span> <span className="var">student</span> = <span className="str">"learner"</span>;</div>
                            <div className="code-line"><span className="kw">const</span> <span className="var">skills</span> = [<span className="str">"React"</span>, <span className="str">"Node"</span>];</div>
                            <div className="code-line"><span className="fn">learnHub</span>.<span className="fn">enroll</span>(<span className="var">skills</span>);</div>
                            <div className="code-line comment">// 🎓 Certificate earned!</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                {stats.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </section>

            {/* Categories */}
            <section className="section">
                <h2 className="section-title">Browse by Category</h2>
                <p className="section-subtitle">Explore our diverse range of learning paths</p>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <Link key={i} to={`/courses?category=${cat.name}`} className="category-card">
                            <span className="cat-icon">{cat.icon}</span>
                            <span className="cat-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="section features-section">
                <h2 className="section-title">Why Choose LearnHub?</h2>
                <p className="section-subtitle">Everything you need to succeed in your learning journey</p>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            {!user && (
                <section className="cta-section">
                    <h2>Ready to Transform Your Career?</h2>
                    <p>Join over 10,000 students who are already learning with LearnHub</p>
                    <Link to="/register" className="btn-hero-primary">Start Learning — It's Free</Link>
                </section>
            )}
        </div>
    );
}
