import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { CURRENCIES } from '../../utils/currency';
import { Compass, MapPin, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export function CreateTripModal({ isOpen, onClose }) {
  const { createTrip } = useTrip();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please sign in or create an account before creating a trip.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a trip name.');
      return;
    }
    if (!destination.trim()) {
      setError('Please enter a trip destination.');
      return;
    }

    try {
      const newTrip = await createTrip({
        name: name.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        currency,
      });

      addToast({
        type: 'success',
        message: `Trip "${newTrip.name}" created! Invite code: ${newTrip.invite_code}`,
      });

      setName('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Trip"
      subtitle="Start an adventure and split expenses effortlessly"
      maxWidth={480}
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
          <label className="form-label">Trip Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Goa Trip 2026, Ladakh Roadtrip..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            autoFocus
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Destination</label>
          <input
            type="text"
            required
            placeholder="e.g. Goa, India or Bali, Indonesia"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label">Default Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="form-select"
          >
            {Object.values(CURRENCIES).map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1.5 }}>
            Create Trip
          </button>
        </div>
      </form>
    </Modal>
  );
}
