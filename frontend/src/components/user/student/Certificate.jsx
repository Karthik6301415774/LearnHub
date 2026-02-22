import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../common/AxiosInstance';
import { useAuth } from '../../../context/AuthContext';
import './Certificate.css';

export default function Certificate() {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const certRef = useRef(null);

    useEffect(() => {
        axiosInstance.get(`/api/users/courses/${courseId}`)
            .then(({ data }) => setCourse(data))
            .catch(() => navigate('/student'));
    }, [courseId]);

    const handleDownload = () => {
        // Just print the certificate div
        window.print();
    };

    if (!course) return <div className="cert-loading">Loading certificate...</div>;

    const date = new Date().toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
        <div className="cert-page">
            <div className="cert-actions no-print">
                <button onClick={() => navigate('/student')} className="btn-back">← Dashboard</button>
                <button onClick={handleDownload} className="btn-download">🖨️ Print / Download</button>
            </div>
            <div className="certificate" ref={certRef}>
                <div className="cert-border">
                    <div className="cert-header">
                        <span className="cert-logo">🎓</span>
                        <h1>LearnHub</h1>
                        <p className="cert-subtitle">Certificate of Completion</p>
                    </div>
                    <div className="cert-body">
                        <p className="cert-presents">This is to certify that</p>
                        <h2 className="cert-name">{user?.name}</h2>
                        <p className="cert-has">has successfully completed the course</p>
                        <h3 className="cert-course">"{course.C_title}"</h3>
                        <p className="cert-teacher">Instructed by <strong>{course.C_educator}</strong></p>
                    </div>
                    <div className="cert-footer">
                        <div className="cert-date">
                            <div className="cert-sign-line"></div>
                            <p>{date}</p>
                            <p>Date</p>
                        </div>
                        <div className="cert-seal">🏅</div>
                        <div className="cert-sig">
                            <div className="cert-sign-line"></div>
                            <p>LearnHub</p>
                            <p>Director</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
