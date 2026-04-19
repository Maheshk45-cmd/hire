import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Globe, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import api from '../api';

export default function AddCompany() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  
  const [search, setSearch] = useState('');
  const [company, setCompany] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [din, setDin] = useState('');
  const [directorName, setDirectorName] = useState('');

  const handleNext = () => setStep(prev => prev + 1);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get(`/company/mca-verify?query=${encodeURIComponent(search)}`);
      setCompany(res.data);
      // Reset DIN fields upon searching new company
      setDin('');
      setDirectorName('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.get(`/company/verify-din?cin=${company.cin}&din=${din}`);
      setDirectorName(res.data.name);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailBypass = () => {
    // Temporary bypass for testing without SMTP
    handleNext();
  };

  const handleCompleteSequence = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      if (role === 'employee') {
        // Send CIN directly so backend doesn't strictly have to verify via domain map only
        const res = await api.post('/company/join-employee', { googleEmail: email, cin: company.cin });
        
        // Update local session data with new employee role
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data.user }));
      } else if (role === 'owner') {
        await api.post('/company/admin/apply', {
             name: directorName || storedUser.name,
             email: email,
             password: 'dummyPassword123', // Legacy backend catch bypass
             cin: company.cin
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="glass-panel animate-enter" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>Add Associated Company</h2>
          <p>Link your profile to an organization.</p>
        </div>

        {/* Step 1: Search & Select */}
        {step === 1 && (
          <div className="stack animate-enter">
            <div className="input-group">
              <label>Company Legal Name or CIN</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Building size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                  <input type="text" className="input-field" placeholder="e.g. Acme Corporation" style={{ paddingLeft: '45px' }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-outline" onClick={handleSearch} disabled={loading || !search}>Search</button>
              </div>
            </div>
            
            {errorMsg && step === 1 && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errorMsg}</p>}

            {company && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <CheckCircle2 color="var(--accent)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>
                  <strong>{company.name} ({company.cin})</strong> verified via MCA database.
                </p>
              </div>
            )}

            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={handleNext} disabled={!company}>
              Confirm Company <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Email Configuration */}
        {step === 2 && (
          <div className="stack animate-enter">
            <div className="input-group">
              <label>Official Work Email</label>
              <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Mail size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                  <input type="email" className="input-field" placeholder="you@acmecorp.com" style={{ paddingLeft: '45px' }} value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
              </div>
            </div>

            {company && email && email.includes('@') && company.domains?.includes(email.split('@')[1].toLowerCase()) && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <Globe color="var(--primary)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>
                  Domain <strong>@{email.split('@')[1]}</strong> verified perfectly matching one of the {company.domains.length} associated organizational domains.
                </p>
              </div>
            )}
            {company && email && email.includes('@') && company.domains && !company.domains?.includes(email.split('@')[1].toLowerCase()) && (
              <p style={{ color: 'var(--warning)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                 Warning: This domain is not currently strictly matched against the verified DB records. This restricts automated approvals.
              </p>
            )}

            {errorMsg && step === 2 && <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{errorMsg}</p>}

            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={handleVerifyEmailBypass} disabled={!email || !email.includes('@') || loading}>
              Confirm Email <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 3: Role Assignment */}
        {step === 3 && (
          <div className="stack animate-enter">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Select Your Role</h3>
            
            <div 
              onClick={() => setRole('employee')}
              style={{ padding: '1rem', border: `2px solid ${role === 'employee' ? 'var(--primary)' : 'var(--panel-border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <Briefcase size={24} color="var(--text-primary)" />
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Employer / Employee</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>I work here. Grants Employee Badge.</p>
              </div>
            </div>

            <div 
              onClick={() => setRole('owner')}
              style={{ padding: '1rem', border: `2px solid ${role === 'owner' ? 'var(--primary)' : 'var(--panel-border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <Building size={24} color="var(--text-primary)" />
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Owner / Director</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>I own or direct this company. (Requires MCA verification)</p>
              </div>
            </div>

            {role === 'owner' && (
              <div className="animate-enter" style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <label>Director Identification Number (DIN)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="input-field" placeholder="8-Digit DIN" value={din} onChange={e => setDin(e.target.value)} disabled={loading || directorName} />
                    {!directorName && (
                      <button className="btn btn-outline" onClick={handleVerifyDin} disabled={loading || !din}>Verify</button>
                    )}
                  </div>
                </div>
                {directorName && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <CheckCircle2 color="var(--accent)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>
                      DIN verified. Official identity matched: <strong>{directorName}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}

            {errorMsg && step === 3 && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '1rem' }}>{errorMsg}</p>}

            <button 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '1rem' }}
              disabled={!role || loading || (role === 'owner' && !directorName)}
              onClick={handleCompleteSequence}
            >
              {loading ? "Processing Link..." : "Complete Association"}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-outline" style={{ border: 'none', color: 'var(--text-secondary)' }} onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
