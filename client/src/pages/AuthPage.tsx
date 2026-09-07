import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) {
          setError('Name is required.');
          setIsSubmitting(false);
          return;
        }
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-app)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px var(--accent-primary-glow)',
              marginBottom: '16px',
            }}
          >
            <Zap size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            FLOWSTATE
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track your time. Understand your patterns. Build better days.
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-surface)' }}>
          {/* Tab Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: '4px',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${!isRegister ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ border: 'none' }}
              onClick={() => {
                setIsRegister(false);
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isRegister ? 'btn-secondary' : 'btn-ghost'}`}
              style={{ border: 'none' }}
              onClick={() => {
                setIsRegister(true);
                setError(null);
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--accent-danger-subtle)',
                border: '1px solid var(--accent-danger-border)',
                color: 'var(--accent-danger)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px', padding: '10px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Authenticating...'
              ) : (
                <>
                  {isRegister ? 'Create Account' : 'Sign In to FlowState'} <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quiet footer */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <ShieldCheck size={13} /> Personal baseline intelligence • Strict data privacy
        </div>
      </div>
    </div>
  );
};
