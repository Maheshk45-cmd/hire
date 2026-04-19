import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Flag, Plus, ArrowLeft, Check, X } from 'lucide-react';
import api from '../api';

export default function Events() {
  const navigate = useNavigate();
  const [eventsData, setEventsData] = useState({ pending: [], approved: [], completed: [] });
  const [pendingApprovals, setPendingApprovals] = useState([]);
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
  const isAdminOrOwner = role === 'ADMIN' || role === 'OWNER';
  const isEmployee = role === 'EMPLOYEE';
  const canCreate = isAdminOrOwner || isEmployee;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get('/events/my-company');
      setEventsData(res.data);

      if (isAdminOrOwner) {
        const approvalRes = await api.get('/events/pending-approvals');
        setPendingApprovals(approvalRes.data.data || []);
      }
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

  const handleApproval = async (id, action) => {
    try {
      setLoading(true);
      await api.post(`/events/${id}/${action}`);
      await fetchEvents();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || `Failed to ${action} event`);
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
            <Plus size={18} /> {showCreate ? 'Cancel' : (isEmployee ? 'Submit New Event' : 'New Event')}
          </button>
        )}
      </header>

      {errorMsg && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errorMsg}</p>}

      {showCreate && canCreate && (
        <div className="glass-panel animate-enter" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>{isEmployee ? "Submit Event for Administrator Review" : "Create Event Blueprint"}</h3>
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
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content' }}>
              {isEmployee ? "Submit for Approval" : "Publish Event"}
            </button>
          </form>
        </div>
      )}

      {loading && !showCreate ? (
        <p>Syncing secure nodes...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          {/* Admin Verification Requests (Only visible to ADMIN/OWNER) */}
          {isAdminOrOwner && (
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--warning)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', color: 'var(--warning)' }}>Employee Pending Approvals</h3>
              <div className="stack">
                {pendingApprovals.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No events require your verification.</p>}
                {pendingApprovals.map((evt) => (
                  <div key={evt._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{evt.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Tickets: ${evt.ticketPrice} - Drafted by {evt.postedBy?.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={() => handleApproval(evt._id, 'approve')}>
                        <Check size={14} /> Approve
                      </button>
                      <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleApproval(evt._id, 'reject')}>
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Pending Collab Events */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Pending Organization Signatures</h3>
            <div className="stack">
              {eventsData.pending?.filter(e => e.eventStatus === 'PENDING_COLLAB').length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No pending events.</p>}
              {eventsData.pending?.filter(e => e.eventStatus === 'PENDING_COLLAB').map((evt) => (
                <div key={evt._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{evt.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Awaiting Signature</p>
                </div>
              ))}
              {isEmployee && eventsData.pending?.filter(e => e.eventStatus === 'PENDING_APPROVAL').map((evt) => (
                <div key={evt._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{evt.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Under Review by Admin</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
