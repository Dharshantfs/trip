import React from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { calculateNetBalances } from '../../utils/debtMinimizer';
import { 
  Plus, 
  KeyRound, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  Compass, 
  TrendingUp 
} from 'lucide-react';

export function TripSelector({ onSelectTrip, onOpenCreateTrip, onOpenJoinTrip }) {
  const { trips, activeTripId, setActiveTripId } = useTrip();
  const { currentUserId, currentUser } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
          }}>
            Your Trips
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {currentUser ? (
              <>Welcome back, <strong>{currentUser.name}</strong>! Select a trip to manage expenses.</>
            ) : (
              <>Welcome to TripSplit! Sign in or create an account to start managing your trips.</>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onOpenJoinTrip} className="btn btn-secondary">
            <KeyRound size={16} />
            Join with Code
          </button>
          <button onClick={onOpenCreateTrip} className="btn btn-primary">
            <Plus size={18} />
            Create Trip
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="card" style={{
          padding: '60px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <Compass size={48} color="var(--color-primary)" />
          <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Your next adventure starts here
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 360 }}>
            Create a trip or enter an invite code from your travel buddies to start splitting expenses.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onOpenCreateTrip} className="btn btn-primary">
              Create Your First Trip
            </button>
            <button onClick={onOpenJoinTrip} className="btn btn-secondary">
              Join with Code
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 20,
        }}>
          {trips.map((trip) => {
            const isActive = trip.id === activeTripId;

            return (
              <div
                key={trip.id}
                className="card card-interactive"
                onClick={() => {
                  setActiveTripId(trip.id);
                  onSelectTrip(trip.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  gap: 20,
                  border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'linear-gradient(145deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.05) 100%)' : 'var(--bg-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                      }}>
                        {trip.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--color-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        marginTop: 3,
                      }}>
                        <MapPin size={14} />
                        <span>{trip.destination}</span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="badge badge-success" style={{ fontSize: '0.688rem' }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  {(trip.start_date || trip.end_date) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8rem',
                      color: 'var(--text-dim)',
                      marginTop: 12,
                    }}>
                      <Calendar size={13} />
                      <span>{trip.start_date} {trip.end_date ? `– ${trip.end_date}` : ''}</span>
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Code: <strong>{trip.invite_code}</strong>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}>
                    <span>Open Trip</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
