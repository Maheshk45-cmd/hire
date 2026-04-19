import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, LayoutDashboard, LogOut, Settings, User } from 'lucide-react';

export default function DashboardBase() {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('user'); // user, admin, owner
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--panel-bg)', borderRight: '1px solid var(--panel-border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Devclash</h2>
        </div>

        {/* Role Switcher */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Profile</p>
          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value)}
            style={{ width: '100%', background: 'transparent', color: 'var(--text-primary)', border: 'none', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="user">Personal (John Doe)</option>
            <option value="owner">Acme Corp (Owner)</option>
            <option value="admin">TechFlow (Admin)</option>
          </select>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <a href="#" className="nav-item active"><LayoutDashboard size={18} /> Dashboard</a>
          <a href="#" className="nav-item"><Calendar size={18} /> Events</a>
          
          {activeRole === 'user' && (
            <a href="#" className="nav-item"><Briefcase size={18} /> Find Jobs</a>
          )}
          
          {(activeRole === 'owner' || activeRole === 'admin') && (
            <a href="#" className="nav-item"><User size={18} /> Manage Employees</a>
          )}

          <div style={{ borderTop: '1px solid var(--panel-border)', margin: '1rem 0' }}></div>
          
          {activeRole === 'user' && (
            <div 
              onClick={() => navigate('/add-company')}
              className="nav-item" 
              style={{ color: 'var(--primary)', cursor: 'pointer' }}
            >
              <Building2 size={18} /> Add Company
            </div>
          )}
          
          <a href="#" className="nav-item"><Settings size={18} /> Settings</a>
        </nav>

        {/* User context footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--panel-border)', cursor: 'pointer' }} onClick={() => navigate('/login')}>
          <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '50%', textAlign: 'center', lineHeight: '36px', fontWeight: 'bold' }}>J</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', margin: 0 }}>John Doe</h4>
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
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your {activeRole === 'user' ? 'personal' : 'company'} dashboard.</p>
          </div>
          <button className="btn btn-primary">Create Event</button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Upcoming Events</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Pending Invites</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>1</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Network Connections</h4>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>142</div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
          <div className="stack" style={{ gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>You registered for <strong>Devops Summit 2026</strong></p>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2 hours ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Acme Corp approved your Admin request</p>
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>1 day ago</span>
            </div>
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
        select option {
          background: var(--bg-color);
        }
      `}</style>
    </div>
  );
}
