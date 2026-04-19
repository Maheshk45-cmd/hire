import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, AppWindow, CheckCircle2, ScanFace, ChevronRight } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, digilocker, face, complete

  const handleNextStep = () => setStep((prev) => prev + 1);

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="glass-panel animate-enter" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <Shield size={32} color="var(--primary)" />
          </div>
          <h2>Create Account</h2>
          <p>Join the premier Devclash B2B network</p>
        </div>

        {/* Progress System */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 1rem' }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ 
              width: '24px', height: '24px', borderRadius: '50%', 
              background: step >= s ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 'bold'
            }}>
              {step > s ? <CheckCircle2 size={14} /> : s}
            </div>
          ))}
        </div>

        {/* --- STEP 1: EMAIL & OTP --- */}
        {step === 1 && (
          <div className="stack animate-enter">
            <div className="input-group">
              <label>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input type="email" className="input-field" placeholder="you@company.com" style={{ paddingLeft: '45px' }} />
              </div>
            </div>
            
            <div className="input-group">
              <label>Enter 6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input type="text" className="input-field" placeholder="• • • • • •" style={{ paddingLeft: '45px', letterSpacing: '4px' }} />
              </div>
            </div>

            <button className="btn btn-primary btn-block" onClick={handleNextStep}>
              Verify & Continue <ChevronRight size={18} />
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1rem' }}>
              Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign in</span>
            </p>
          </div>
        )}

        {/* --- STEP 2: BASIC DETAILS --- */}
        {step === 2 && (
          <div className="stack animate-enter">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>First Name</label>
                <input type="text" className="input-field" placeholder="John" />
              </div>
              <div className="input-group">
                <label>Surname</label>
                <input type="text" className="input-field" placeholder="Doe" />
              </div>
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input type="password" className="input-field" placeholder="••••••••" />
            </div>

            <button className="btn btn-primary btn-block" onClick={handleNextStep}>
              Save Details <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* --- STEP 3: KYC IDENTITY VERIFICATION --- */}
        {step === 3 && (
          <div className="stack animate-enter">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Identity Verification</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Please verify your identity for compliance requirements.</p>
            
            <div style={{ border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              {verificationStatus === 'pending' && (
                <div style={{ textAlign: 'center' }}>
                  <AppWindow size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <h4>DigiLocker Verification</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>We will fetch your Aadhaar/PAN data securely.</p>
                  <button className="btn btn-outline" onClick={() => setVerificationStatus('digilocker')}>Connect DigiLocker</button>
                </div>
              )}
              
              {verificationStatus === 'digilocker' && (
                <div style={{ textAlign: 'center' }}>
                  <ScanFace size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                  <h4>Face Verification</h4>
                  <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Match your live face with ID records.</p>
                  <button className="btn btn-outline" onClick={() => setVerificationStatus('complete')}>Start Camera</button>
                </div>
              )}

              {verificationStatus === 'complete' && (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle2 size={48} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                  <h4 style={{ color: 'var(--accent)' }}>Verification Complete</h4>
                </div>
              )}
            </div>

            <button 
              className="btn btn-primary btn-block" 
              onClick={handleNextStep}
              disabled={verificationStatus !== 'complete'}
              style={{ opacity: verificationStatus !== 'complete' ? 0.5 : 1 }}
            >
              Continue to Roles <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* --- STEP 4: ROLE SELECTION --- */}
        {step === 4 && (
          <div className="stack animate-enter">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>How will you use Devclash?</h3>
            
            <div 
              onClick={() => setRole('user')}
              style={{ padding: '1.5rem', border: `2px solid ${role === 'user' ? 'var(--primary)' : 'var(--panel-border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                <User size={24} color="var(--text-primary)" />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Simple User Profile</h4>
                <p style={{ fontSize: '0.85rem' }}>Network, find jobs, and attend events.</p>
              </div>
            </div>

            <div 
              onClick={() => setRole('company')}
              style={{ padding: '1.5rem', border: `2px solid ${role === 'company' ? 'var(--primary)' : 'var(--panel-border)'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                <AppWindow size={24} color="var(--text-primary)" />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Company Admin / Owner</h4>
                <p style={{ fontSize: '0.85rem' }}>Manage company profile, hiring, and events.</p>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                if (role === 'user') navigate('/dashboard');
                if (role === 'company') navigate('/company-flow');
              }}
              disabled={!role}
            >
              Complete Setup <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
