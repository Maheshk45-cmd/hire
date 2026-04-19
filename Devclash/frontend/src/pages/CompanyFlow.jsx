import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, CheckCircle, Clock } from 'lucide-react';

export default function CompanyFlow() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState(null); // Simulated MCA fetch result
  const [flowStatus, setFlowStatus] = useState('search'); // search, found-no-admin, found-has-admin

  const handleSearch = () => {
    // Mock MCA fetch
    if (search.toLowerCase().includes('acme')) {
      setCompany({ name: 'Acme Corp', cin: 'L12345MH2023PTC123456', hasAdmin: true });
      setFlowStatus('found-has-admin');
    } else {
      setCompany({ name: search || 'New Tech Inc', cin: 'U72900KA2021PTC098765', hasAdmin: false });
      setFlowStatus('found-no-admin');
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '2rem 0' }}>
      <div className="glass-panel animate-enter" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Building2 size={32} color="var(--primary)" />
          </div>
          <h2>Company Setup</h2>
          <p>Find your company in the MCA database to claim admin access.</p>
        </div>

        {flowStatus === 'search' && (
          <div className="stack">
            <div className="input-group">
              <label>Search Company (CIN or Name)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Acme Corp..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleSearch} disabled={!search}>
                  <Search size={18} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              We will securely fetch data from the Ministry of Corporate Affairs API.
            </p>
          </div>
        )}

        {flowStatus === 'found-no-admin' && company && (
          <div className="stack animate-enter">
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{company.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>CIN: {company.cin}</p>
                </div>
                <span className="badge badge-green">No Admin Claims</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.9rem' }}>Since no one has claimed administrative rights for this company yet, you can claim it as an Owner.</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--warning)', marginTop: '-0.5rem', marginBottom: '1rem' }}>Note: You must be a registered director on the MCA database.</p>

            <button className="btn btn-primary btn-block" onClick={() => navigate('/dashboard')}>
              <CheckCircle size={18} /> Claim Admin Access
            </button>
            <button className="btn btn-outline btn-block" onClick={() => setFlowStatus('search')}>
              Try Another Search
            </button>
          </div>
        )}

        {flowStatus === 'found-has-admin' && company && (
          <div className="stack animate-enter">
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{company.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>CIN: {company.cin}</p>
                </div>
                <span className="badge badge-blue">Admin Exists</span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem' }}>This company already has an active Administrator.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--panel-border)', borderRadius: '8px', cursor: 'pointer' }} className="glass-panel text-center hover-effect">
                <Clock size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.9rem' }}>Request Access</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Send a request to the current Admin.</p>
              </div>

              <div style={{ padding: '1rem', border: '1px solid var(--panel-border)', borderRadius: '8px', cursor: 'pointer' }} className="glass-panel text-center hover-effect">
                <CheckCircle size={24} color="var(--accent)" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '0.9rem' }}>Nominate</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Get nominated by another director via voting.</p>
              </div>
            </div>

            <button className="btn btn-outline btn-block" style={{ marginTop: '1rem' }} onClick={() => setFlowStatus('search')}>
              Try Another Search
            </button>
          </div>
        )}

      </div>

      <style>{`
        .hover-effect:hover {
          background: rgba(255,255,255,0.05); border-color: var(--primary);
        }
        .text-center { text-align: center; }
      `}</style>
    </div>
  );
}
