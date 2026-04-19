import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Flag, Plus, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function Events() {
  const navigate = useNavigate();
  const [eventsData, setEventsData] = useState({ pending: [], approved: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    ticketPrice: 0,
    eventStartDate: '',
    eventEndDate: ''
  });

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const role = storedUser?.role?.toUpperCase() || 'USER';
  const canCreate = role === 'ADMIN' || role === 'OWNER';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/events/my-company');
      setEventsData(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to sync events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/events/create', newEvent);
      setShowCreate(false);
      setNewEvent({ title: '', description: '', ticketPrice: 0, eventStartDate: '', eventEndDate: '' });
      await fetchEvents(); // Refresh data
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create event');
      setLoading(false);
    }
  };

  const handleReportEvent = async (id) => {
    try {
      setLoading(true);
      await api.post(`/events/${id}/report`);
      await fetchEvents(); // State logic refresh
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to report event');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', padding: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>Event Hub</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage and secure upcoming collaborations.</p>
          </div>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={18} /> {showCreate ? 'Cancel' : 'New Event'}
          </button>
        )}
      </header>

      {errorMsg && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMsg}</p>}

      {showCreate && canCreate && (
        <div className="glass-panel animate-enter" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Create Event Blueprint</h3>
          <form onSubmit={handleCreateEvent} className="stack" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Event Title</label>
                <input required type="text" className="input-field" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Ticket Price (USD)</label>
                <input required type="number" className="input-field" min="0" value={newEvent.ticketPrice} onChange={e => setNewEvent({...newEvent, ticketPrice: e.target.value})} />
              </div>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea required className="input-field" rows="3" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Start Date</label>
                <input required type="date" className="input-field" value={newEvent.eventStartDate} onChange={e => setNewEvent({...newEvent, eventStartDate: e.target.value})} />
              </div>
              <div className="input-group">
                <label>End Date</label>
                <input required type="date" className="input-field" value={newEvent.eventEndDate} onChange={e => setNewEvent({...newEvent, eventEndDate: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content' }}>Publish Event</button>
          </form>
        </div>
      )}

      {loading && !showCreate ? (
        <p>Syncing secure nodes...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Approved Events */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Live Escrow Events</h3>
            <div className="stack">
              {eventsData.approved?.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No live events found.</p>}
              {eventsData.approved?.map((evt) => (
                <div key={evt._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{evt.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Tickets: ${evt.ticketPrice}</p>
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleReportEvent(evt._id)}>
                    <Flag size={14} /> Report
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Events */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Pending Approval</h3>
            <div className="stack">
              {eventsData.pending?.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No pending events.</p>}
              {eventsData.pending?.map((evt) => (
                <div key={evt._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{evt.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Awaiting Signature</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
