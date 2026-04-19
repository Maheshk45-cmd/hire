import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, LayoutDashboard, LogOut, Settings, User } from 'lucide-react';
import api from '../api';

export default function DashboardBase() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, feedRes] = await Promise.all([
          api.get('/dashboard/me'),
          api.get('/activity/feed').catch(() => ({ data: { activities: [] } }))
        ]);
        setData(dashRes.data);
        setActivities(feedRes.data.activities || []);
      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
  if (!data) return <div style={{ padding: '2rem' }}>Error loading dashboard. Please login again.</div>;

  const role = data.user?.role?.toUpperCase() || 'USER';
  const displayRole = role === 'USER' ? 'Personal' : `${data.company?.name || 'Company'} (${role})`;
  
  const stats = data.stats || {};
  const totalEvents = stats.totalEvents || 0;
  const pendingJobs = stats.pendingJobs || 0;
  const liveJobs = stats.liveJobs || 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--panel-bg)', borderRight: '1px solid var(--panel-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Devclash</h2>
        </div>

        {/* Role Display */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Profile</p>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {displayRole}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div className="nav-item active"><LayoutDashboard size={18} /> Dashboard</div>
          <div className="nav-item" onClick={() => navigate('/events')} style={{ cursor: 'pointer' }}><Calendar size={18} /> Events</div>
          
          <div className="nav-item" style={{ cursor: 'pointer' }}><Briefcase size={18} /> Find Jobs</div>
          
          {(role === 'OWNER' || role === 'ADMIN') && (
            <div className="nav-item" style={{ cursor: 'pointer' }}><User size={18} /> Manage Employees</div>
          )}

          <div style={{ borderTop: '1px solid var(--panel-border)', margin: '1rem 0' }}></div>
          
          {role === 'USER' && (
            <div onClick={() => navigate('/add-company')} className="nav-item" style={{ color: 'var(--primary)', cursor: 'pointer' }}>
              <Building2 size={18} /> Add Company
            </div>
          )}
          
          <div className="nav-item" style={{ cursor: 'pointer' }}><Settings size={18} /> Settings</div>
        </nav>

        {/* User context footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)', cursor: 'pointer' }} onClick={handleLogout}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '50%', textAlign: 'center', lineHeight: '36px', fontWeight: 'bold' }}>
            {data.user.email ? data.user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontSize: '0.9rem', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{data.user.email}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Logout</p>
          </div>
          <LogOut size={18} color="var(--text-secondary)" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Overview</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your {role === 'USER' ? 'personal' : 'company'} dashboard.</p>
          </div>
          {(role === 'ADMIN' || role === 'OWNER') && (
            <button className="btn btn-primary" onClick={() => navigate('/events')}>Create Event</button>
          )}
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Events</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalEvents}</div>
          </div>
          {(role === 'ADMIN' || role === 'OWNER') && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Jobs</h4>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pendingJobs}</div>
            </div>
          )}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Live Jobs</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{liveJobs}</div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div className="stack" style={{ gap: '1.5rem' }}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>{act.message}</p>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {new Date(act.createdAt).toLocaleDateString()}
                </span>
              </div>
            )) : (
              <p style={{ color: 'var(--text-secondary)' }}>No recent activity to show.</p>
            )}
          </div>
        </div>

      </main>

      {/* Embedded CSS just for this component */}
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
