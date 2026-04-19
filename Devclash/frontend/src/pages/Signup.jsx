import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, AppWindow, CheckCircle2, ScanFace, ChevronRight } from 'lucide-react';
import api from '../api';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, digilocker, face, complete

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNextStep = () => setStep((prev) => prev + 1);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !password) {
      setErrorMsg("Please fill in your name and password details first.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    
    try {
      setLoading(true);
      setErrorMsg('');
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');
      
      // 1. Verify OTP natively
      await api.post('/auth/verify-otp', { email, otp });
      
      // 2. Signup officially
      const name = `${firstName} ${lastName}`.trim();
      await api.post('/auth/signup', { email, password, name });
      
      // Complete! Advanced into Identity flow
      handleNextStep();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Signup failed. Please verify your OTP carefully.');
    } finally {
      setLoading(false);
    }
  };

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
          {[1, 2, 3].map((s) => (
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

        {/* --- STEP 1: All Details + OTP --- */}
        {step === 1 && (
          <form className="stack animate-enter" onSubmit={otpSent ? handleVerifyAndSignup : handleSendOtp}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>First Name</label>
                <input required type="text" className="input-field" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} disabled={otpSent || loading} />
              </div>
              <div className="input-group">
                <label>Surname</label>
                <input required type="text" className="input-field" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} disabled={otpSent || loading} />
              </div>
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input required type="password" minLength={6} className="input-field" placeholder="••••••••" style={{ paddingLeft: '45px' }} value={password} onChange={e => setPassword(e.target.value)} disabled={otpSent || loading} />
              </div>
            </div>

            <div className="input-group">
              <label>Work Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
                <input required type="email" className="input-field" placeholder="you@company.com" style={{ paddingLeft: '45px' }} value={email} onChange={e => setEmail(e.target.value)} disabled={otpSent || loading} />
              </div>
            </div>

            {otpSent && (
              <div className="input-group animate-enter">
                <label>Enter 6-Digit Verification Code</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--primary)' }} />
                  <input required type="text" maxLength={6} className="input-field" placeholder="• • • • • •" style={{ paddingLeft: '45px', letterSpacing: '4px' }} value={otp} onChange={e => setOtp(e.target.value)} disabled={loading} />
                </div>
              </div>
            )}

            {errorMsg && step === 1 && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{errorMsg}</p>}

            {!otpSent ? (
              <button type="submit" className="btn btn-primary btn-block" disabled={loading || !email}>
                {loading ? 'Requesting...' : 'Send OTP'}
              </button>
            ) : (
              <button type="submit" className="btn btn-primary btn-block" disabled={loading || otp.length < 6}>
                {loading ? 'Securing Account...' : 'Verify & Create Account'} <ChevronRight size={18} />
              </button>
            )}

            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1rem' }}>
              Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign in</span>
            </p>
          </form>
        )}

        {/* --- STEP 2: KYC IDENTITY VERIFICATION --- */}
        {step === 2 && (
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

        {/* --- STEP 3: ROLE SELECTION --- */}
        {step === 3 && (
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
                if (role === 'user') navigate('/login'); // Force authentic login flow
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
