import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app we'd determine role based on login response
    // For now we just route to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-enter" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
            <LogIn size={32} color="var(--accent)" />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to Devclash</p>
        </div>

        <form onSubmit={handleLogin} className="stack">
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
              <input type="email" required className="input-field" placeholder="you@example.com" style={{ paddingLeft: '45px' }} />
            </div>
          </div>
          
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ marginBottom: 0 }}>Password</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }}>Forgot?</span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '15px', left: '15px', color: 'var(--text-secondary)' }} />
              <input type="password" required className="input-field" placeholder="••••••••" style={{ paddingLeft: '45px' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '0.5rem' }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Don't have an account? <span onClick={() => navigate('/signup')} style={{ color: 'var(--primary)', cursor: 'pointer' }}>Sign up</span>
        </p>

      </div>
    </div>
  );
}
