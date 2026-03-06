import { useState, useEffect } from 'react';
import axiosInstance from '../../common/AxiosInstance';
import { toast } from 'react-toastify';

export default function LiveSessionsManager({ teacherCourses }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sessionUrl, setSessionUrl] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [courseId, setCourseId] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const { data } = await axiosInstance.get('/api/admin/live-sessions');
            setSessions(data);
        } catch {
            toast.error('Failed to load live sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/admin/live-sessions', {
                courseId, title, description, sessionUrl, scheduledAt
            });
            toast.success('Live Session scheduled!');
            setShowForm(false);
            setTitle(''); setDescription(''); setSessionUrl(''); setScheduledAt(''); setCourseId('');
            fetchSessions();
        } catch {
            toast.error('Failed to create session');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axiosInstance.put(`/api/admin/live-sessions/${id}/toggle`);
            toast.success('Status updated');
            fetchSessions();
        } catch {
            toast.error('Status update failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        try {
            await axiosInstance.delete(`/api/admin/live-sessions/${id}`);
            toast.success('Session deleted');
            fetchSessions();
        } catch {
            toast.error('Delete failed');
        }
    };

    if (loading) return <div style={{ color: 'rgba(255,255,255,0.6)' }}>Loading Live Sessions...</div>;

    return (
        <div style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🔴 Live Sessions</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary-pill">
                    {showForm ? 'Cancel' : '+ Schedule Session'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a78bfa' }}>Course</label>
                            <select required value={courseId} onChange={e => setCourseId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }}>
                                <option value="">-- Select Course --</option>
                                {teacherCourses?.map(c => (
                                    <option key={c._id} value={c._id}>{c.C_title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a78bfa' }}>Session Title</label>
                            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Q&A for React Router" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a78bfa' }}>Meeting Link (Zoom/Meet)</label>
                            <input required type="url" value={sessionUrl} onChange={e => setSessionUrl(e.target.value)} placeholder="https://zoom.us/..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a78bfa' }}>Date & Time</label>
                            <input required type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none' }} />
                        </div>
                    </div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#a78bfa' }}>Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', marginBottom: '1rem' }} />
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>Schedule Now</button>
                </form>
            )}

            <div style={{ display: 'grid', gap: '1rem' }}>
                {sessions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        No live sessions scheduled yet.
                    </div>
                ) : (
                    sessions.map(s => (
                        <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '8px', borderLeft: s.isLive ? '4px solid #ef4444' : '4px solid #4f46e5' }}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: s.isLive ? '#f87171' : '#e2e8f0' }}>
                                    {s.isLive && '🔴 LIVE NOW: '} {s.title}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '15px' }}>
                                    <span>📅 {new Date(s.scheduledAt).toLocaleString()}</span>
                                    <span>📚 {s.courseId?.C_title || 'Unknown Course'}</span>
                                    <span>🔗 <a href={s.sessionUrl} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Join Link</a></span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleToggleStatus(s._id)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: s.isLive ? '#3f3f46' : '#ef4444', color: 'white', fontWeight: 'bold' }}>
                                    {s.isLive ? 'End Stream' : 'Go Live'}
                                </button>
                                <button onClick={() => handleDelete(s._id)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#3f3f46', color: 'white' }}>
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
