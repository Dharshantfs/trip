import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { KeyRound, AlertCircle, ArrowRight, MapPin, Users } from 'lucide-react';

export function JoinTripModal({ isOpen, onClose, initialCode = '' }) {
  const { trips, joinTrip } = useTrip();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');

  const trimmedCode = code.trim().toUpperCase();
  const matchedTrip = trips.find(t => t.invite_code === trimmedCode);

  const handleSubmit = (e) => {
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

    const result = joinTrip(trimmedCode);
    if (!result.success) {
      setError(result.message);
      return;
    }

    addToast({
      type: 'success',
      message: result.message,
    });

    setCode('');
    onClose();
  };

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
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
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
          </div>
        </div>

        {/* Live Trip Preview Card */}
        {matchedTrip && (
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
              Found Trip
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              {matchedTrip.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} color="var(--color-primary)" />
                {matchedTrip.destination}
              </span>
              <span>•</span>
              <span>Code: {matchedTrip.invite_code}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
            Join Trip
          </button>
        </div>
      </form>
    </Modal>
  );
}
