import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Globe, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function AddCompany() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);

  const handleNext = () => setStep(prev => prev + 1);

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
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input type="text" className="input-field" placeholder="e.g. Acme Corporation" style={{ paddingLeft: '45px' }} />
              </div>
            </div>
            
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <CheckCircle2 color="var(--accent)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>
                <strong>Acme Corp (L12345MH2023PTC123456)</strong> verified via MCA database.
              </p>
            </div>

            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={handleNext}>
              Confirm Company <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Email & Domain Verification */}
        {step === 2 && (
          <div className="stack animate-enter">
            <div className="input-group">
              <label>Official Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input type="email" className="input-field" placeholder="you@acmecorp.com" style={{ paddingLeft: '45px' }} />
              </div>
            </div>
            
            <div className="input-group">
              <label>OTP from Work Email</label>
              <input type="text" className="input-field" placeholder="• • • • • •" style={{ letterSpacing: '4px' }} />
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <Globe color="var(--primary)" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-primary)' }}>
                Domain <strong>@acmecorp.com</strong> verified and matches company records.
              </p>
            </div>

            <button className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} onClick={handleNext}>
              Verify Work Email <ChevronRight size={18} />
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
              <div className="input-group animate-enter" style={{ marginTop: '1rem' }}>
                <label>Registered Director Name</label>
                <input type="text" className="input-field" placeholder="Must match MCA records perfectly" />
              </div>
            )}

            <button 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '1rem' }}
              disabled={!role}
              onClick={() => navigate('/dashboard')}
            >
              Complete Association
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
