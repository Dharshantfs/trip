import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { KeyRound, AlertCircle, ArrowRight, MapPin, Users, Loader2, Database } from 'lucide-react';
import { dbFindTripByInviteCode, isSupabaseConfigured } from '../../utils/supabase';

export function JoinTripModal({ isOpen, onClose, initialCode = '', onOpenDatabaseModal }) {
  const { trips, joinTrip } = useTrip();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [livePreviewTrip, setLivePreviewTrip] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode || '');
      setError('');
      setIsSubmitting(false);
      setLivePreviewTrip(null);
    }
  }, [isOpen, initialCode]);

  const trimmedCode = code.trim().toUpperCase();
  const matchedLocalTrip = trips.find(t => t.invite_code === trimmedCode);

  // Live lookup preview if not in local memory
  useEffect(() => {
    if (matchedLocalTrip) {
      setLivePreviewTrip(matchedLocalTrip);
      return;
    }

    if (trimmedCode.length >= 4 && isSupabaseConfigured()) {
      let active = true;
      setIsPreviewLoading(true);
      dbFindTripByInviteCode(trimmedCode).then(found => {
        if (active) {
          setLivePreviewTrip(found);
          setIsPreviewLoading(false);
        }
      }).catch(() => {
        if (active) setIsPreviewLoading(false);
      });
      return () => { active = false; };
    } else {
      setLivePreviewTrip(null);
    }
  }, [trimmedCode, matchedLocalTrip]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please sign in or create an account first to join this trip.');
      return;
    }

    if (!trimmedCode) {
      setError('Please enter an invite code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await joinTrip(trimmedCode);
      if (!result.success) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      addToast({
        type: 'success',
        message: result.message,
      });

      setCode('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to join trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewTrip = matchedLocalTrip || livePreviewTrip;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join a Trip"
      subtitle="Enter a 6-character trip invite code from your friends"
      maxWidth={440}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </div>
            {!isSupabaseConfigured() && onOpenDatabaseModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDatabaseModal();
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  marginTop: 6,
                  alignSelf: 'flex-start',
                  fontSize: '0.75rem',
                  gap: 6,
                }}
              >
                <Database size={13} />
                Connect Supabase Cloud DB
              </button>
            )}
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Trip Invite Code</label>
          <div style={{ position: 'relative' }}>
            <KeyRound size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 14, top: 13 }} />
            <input
              type="text"
              required
              maxLength={8}
              placeholder="e.g. GOA6X9"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="form-input"
              style={{
                paddingLeft: 42,
                fontSize: '1.2rem',
                letterSpacing: '0.12em',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
              autoFocus
            />
            {isPreviewLoading && (
              <Loader2 
                size={18} 
                className="spin-animation" 
                color="var(--color-primary)" 
                style={{ position: 'absolute', right: 14, top: 13 }} 
              />
            )}
          </div>
        </div>

        {/* Live Trip Preview Card */}
        {previewTrip && (
          <div style={{
            background: 'var(--color-primary-light)',
            border: '1px solid var(--color-primary-glow)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Trip Found
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {previewTrip.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color="var(--color-primary)" />
                {previewTrip.destination}
              </span>
              <span>•</span>
              <span>Code: <strong>{previewTrip.invite_code}</strong></span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting || !trimmedCode} 
            style={{ flex: 1.5, opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                Joining...
              </>
            ) : (
              'Join Trip'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
