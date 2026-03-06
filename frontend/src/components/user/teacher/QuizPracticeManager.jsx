import { useState, useEffect } from 'react';
import axiosInstance from '../../common/AxiosInstance';
import { toast } from 'react-toastify';

export default function QuizPracticeManager({ courseId }) {
    const [quizzes, setQuizzes] = useState([]);
    const [practices, setPractices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showQuizForm, setShowQuizForm] = useState(false);
    const [quizForm, setQuizForm] = useState({ title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0 }] });

    const [showPracticeForm, setShowPracticeForm] = useState(false);
    const [practiceForm, setPracticeForm] = useState({ title: '', description: '', dueDate: '', submissionType: 'text' });
    const [savingQuiz, setSavingQuiz] = useState(false);
    const [savingPractice, setSavingPractice] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [courseId]);

    const fetchData = async () => {
        try {
            const [qRes, pRes] = await Promise.all([
                axiosInstance.get(`/api/admin/courses/${courseId}/quiz`),
                axiosInstance.get(`/api/admin/courses/${courseId}/practice`)
            ]);
            setQuizzes(qRes.data);
            setPractices(pRes.data);
        } catch {
            toast.error('Failed to load quizzes/practices');
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        setSavingQuiz(true);
        try {
            await axiosInstance.post(`/api/admin/courses/${courseId}/quiz`, quizForm);
            toast.success('Quiz added!');
            setShowQuizForm(false);
            setQuizForm({ title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctIndex: 0 }] });
            fetchData();
        } catch {
            toast.error('Failed to add quiz');
        } finally {
            setSavingQuiz(false);
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (!window.confirm('Delete this quiz?')) return;
        try {
            await axiosInstance.delete(`/api/admin/quiz/${id}`);
            toast.success('Quiz deleted');
            fetchData();
        } catch {
            toast.error('Delete failed');
        }
    };

    const handleAddPractice = async (e) => {
        e.preventDefault();
        setSavingPractice(true);
        try {
            await axiosInstance.post(`/api/admin/courses/${courseId}/practice`, practiceForm);
            toast.success('Practice session added!');
            setShowPracticeForm(false);
            setPracticeForm({ title: '', description: '', dueDate: '', submissionType: 'text' });
            fetchData();
        } catch {
            toast.error('Failed to add practice');
        } finally {
            setSavingPractice(false);
        }
    };

    const handleDeletePractice = async (id) => {
        if (!window.confirm('Delete this practice session?')) return;
        try {
            await axiosInstance.delete(`/api/admin/practice/${id}`);
            toast.success('Practice deleted');
            fetchData();
        } catch {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>Loading extras...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2.5rem' }}>
            {/* Quizzes Column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>🧠 Quizzes ({quizzes.length})</h2>
                    <button onClick={() => setShowQuizForm(!showQuizForm)} className="btn-primary-pill" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                        {showQuizForm ? 'Cancel' : '+ Add Quiz'}
                    </button>
                </div>

                {showQuizForm && (
                    <form onSubmit={handleAddQuiz} className="add-section-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#1e1b4b', borderRadius: '12px' }}>
                        <input required placeholder="Quiz Title" value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white' }} />
                        <textarea placeholder="Description" value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} style={{ width: '100%', marginBottom: '15px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white' }} />

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#a78bfa' }}>Add Question 1</h4>
                            <input required placeholder="Type the question here" value={quizForm.questions[0].question} onChange={e => { const q = [...quizForm.questions]; q[0].question = e.target.value; setQuizForm({ ...quizForm, questions: q }); }} style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: 'none' }} />
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '10px 0 5px' }}>Select the correct answer icon below:</p>
                            {quizForm.questions[0].options.map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                                    <input type="radio" name="corr" checked={quizForm.questions[0].correctIndex === i} onChange={() => { const q = [...quizForm.questions]; q[0].correctIndex = i; setQuizForm({ ...quizForm, questions: q }); }} />
                                    <input required placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const q = [...quizForm.questions]; q[0].options[i] = e.target.value; setQuizForm({ ...quizForm, questions: q }); }} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="btn-primary" disabled={savingQuiz} style={{ width: '100%', padding: '10px' }}>{savingQuiz ? 'Saving...' : 'Save Quiz'}</button>
                    </form>
                )}

                <div className="mc-section-list" style={{ gap: '10px' }}>
                    {quizzes.map(q => (
                        <div key={q._id} className="mc-section-item" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>{q.title}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>{q.questions.length} Question{q.questions.length !== 1 && 's'}</div>
                            </div>
                            <button onClick={() => handleDeleteQuiz(q._id)} className="btn-del-section" title="Delete Quiz">🗑️</button>
                        </div>
                    ))}
                    {quizzes.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2rem' }}>No quizzes added yet.</p>}
                </div>
            </div>

            {/* Practice Column */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>📝 Practice ({practices.length})</h2>
                    <button onClick={() => setShowPracticeForm(!showPracticeForm)} className="btn-primary-pill" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                        {showPracticeForm ? 'Cancel' : '+ Add Practice'}
                    </button>
                </div>

                {showPracticeForm && (
                    <form onSubmit={handleAddPractice} className="add-section-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#312e81', borderRadius: '12px' }}>
                        <input required placeholder="Practice Title" value={practiceForm.title} onChange={e => setPracticeForm({ ...practiceForm, title: e.target.value })} style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white' }} />
                        <textarea required placeholder="Description / Task Instructions" rows="3" value={practiceForm.description} onChange={e => setPracticeForm({ ...practiceForm, description: e.target.value })} style={{ width: '100%', marginBottom: '10px', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white' }} />

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: '#a78bfa', display: 'block', marginBottom: '5px' }}>Due Date (Optional):</label>
                                <input type="date" value={practiceForm.dueDate} onChange={e => setPracticeForm({ ...practiceForm, dueDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.8rem', color: '#a78bfa', display: 'block', marginBottom: '5px' }}>Submission Type:</label>
                                <select value={practiceForm.submissionType} onChange={e => setPracticeForm({ ...practiceForm, submissionType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}>
                                    <option value="text">Text Response</option>
                                    <option value="link">URL / Link Submission</option>
                                    <option value="file">File Upload (PDF/ZIP)</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={savingPractice} style={{ width: '100%', padding: '10px', background: '#4f46e5' }}>{savingPractice ? 'Saving...' : 'Save Practice'}</button>
                    </form>
                )}

                <div className="mc-section-list" style={{ gap: '10px' }}>
                    {practices.map(p => (
                        <div key={p._id} className="mc-section-item" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <div>
                                <strong style={{ color: '#e2e8f0' }}>{p.title}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>
                                    <span style={{ textTransform: 'uppercase' }}>{p.submissionType}</span> SUBMISSION
                                    {p.dueDate && ` • Due: ${new Date(p.dueDate).toLocaleDateString()}`}
                                </div>
                            </div>
                            <button onClick={() => handleDeletePractice(p._id)} className="btn-del-section" title="Delete Practice">🗑️</button>
                        </div>
                    ))}
                    {practices.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '2rem' }}>No practice sessions added yet.</p>}
                </div>
            </div>
        </div>
    );
}
