import React, { useState, useEffect } from 'react';
import { 
  getSupabaseCredentials, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection,
  isSupabaseConfigured 
} from '../../utils/supabase';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import confetti from 'canvas-confetti';
import { 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Globe, 
  Trash2,
  RefreshCw
} from 'lucide-react';

export function DatabaseModal({ isOpen, onClose, onConnected }) {
  const { addToast } = useToast();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      const creds = getSupabaseCredentials();
      setUrl(creds.url || '');
      setAnonKey(creds.anonKey || '');
      setIsConfigured(isSupabaseConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      const resp = await fetch('/supabase_schema.sql');
      const text = await resp.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      addToast({ type: 'success', message: 'SQL schema copied to clipboard!' });
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      // Fallback
      addToast({ type: 'info', message: 'SQL schema is in supabase_schema.sql in your repo.' });
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      setError('Please provide both your Supabase Project URL and Anon Key.');
      return;
    }

    if (!cleanUrl.startsWith('https://')) {
      setError('Project URL must start with https:// (e.g. https://xyzcompany.supabase.co)');
      return;
    }

    setIsTesting(true);
    const testRes = await testSupabaseConnection(cleanUrl, cleanKey);
    setIsTesting(false);

    if (!testRes.success) {
      setError(`Connection failed: ${testRes.message}. Please check your URL, Anon Key, and verify you ran the SQL schema.`);
      return;
    }

    saveSupabaseConfig(cleanUrl, cleanKey);
    setIsConfigured(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    addToast({ type: 'success', message: 'Connected to Supabase PostgreSQL! Data now syncs in real-time across all devices.' });
    
    if (onConnected) {
      onConnected();
    }

    setTimeout(() => {
      onClose();
      window.location.reload(); // reload to rebind real-time subscriptions
    }, 1200);
  };

  const handleDisconnect = () => {
    if (window.confirm('Disconnect Supabase cloud database from this browser?')) {
      clearSupabaseConfig();
      setIsConfigured(false);
      setUrl('');
      setAnonKey('');
      addToast({ type: 'info', message: 'Supabase disconnected.' });
      setTimeout(() => window.location.reload(), 500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect Cloud Database (Supabase)"
      subtitle="Share trips, members, and live expenses across all phones and devices"
      maxWidth={520}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 'var(--radius-lg)',
          background: isConfigured ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
          border: `1px solid ${isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} color={isConfigured ? 'var(--color-success)' : 'var(--color-warning)'} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {isConfigured ? 'Cloud Database Connected' : 'Cloud Database Not Connected'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isConfigured 
                  ? 'All devices and travelers share live data via Supabase PostgreSQL' 
                  : 'Currently data is isolated to this browser. Connect Supabase to share with friends!'}
              </div>
            </div>
          </div>

          {isConfigured && (
            <button
              onClick={handleDisconnect}
              className="btn-ghost btn-sm"
              style={{ color: 'var(--color-danger)', fontSize: '0.75rem', padding: '4px 8px' }}
              title="Disconnect"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* 3 Step Setup Guide */}
        <div style={{
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontSize: '0.85rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            3-Step Quick Setup (Free & takes 60 seconds):
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>1</span>
            <div>
              Go to{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              >
                supabase.com <ExternalLink size={12} style={{ display: 'inline' }} />
              </a>{' '}
              and click <strong>New Project</strong> (100% Free).
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>2</span>
            <div>
              In Supabase dashboard, click <strong>SQL Editor</strong>, paste our schema, and click <strong>Run</strong>.
              <button
                type="button"
                onClick={handleCopySql}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: 8, padding: '2px 8px', fontSize: '0.75rem' }}
              >
                {copiedSql ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              flexShrink: 0,
            }}>3</span>
            <div>
              Go to <strong>Project Settings ➔ API</strong>, copy your <strong>Project URL</strong> and <strong>Anon Key</strong> below:
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Supabase Project URL</label>
            <div style={{ position: 'relative' }}>
              <Globe size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="url"
                required
                placeholder="https://yourprojectid.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38, fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Project Anon Public Key (anon / public)</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38, fontSize: '0.875rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTesting}
              className="btn btn-primary"
              style={{ flex: 1.5 }}
            >
              {isTesting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Connect & Save
                </>
              )}
            </button>
          </div>
        </form>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
          💡 <strong>Tip for Vercel:</strong> You can also set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> directly in your Vercel Project Settings ➔ Environment Variables so it connects automatically for everyone!
        </div>
      </div>
    </Modal>
  );
}
