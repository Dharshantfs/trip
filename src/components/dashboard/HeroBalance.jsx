import React from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { useCountUp } from '../../hooks/useCountUp';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users,
  Plus,
  Handshake,
  Share2
} from 'lucide-react';

export function HeroBalance({ onOpenAddExpense, onOpenSettle, onOpenInvite }) {
  const { activeTrip, totalTripExpense, userSummary, tripMembers } = useTrip();
  const { currentUser } = useAuth();

  const animatedTotal = useCountUp(totalTripExpense, 800);
  const animatedNet = useCountUp(userSummary.netBalance, 800);

  if (!activeTrip) return null;

  const currency = activeTrip.currency || 'INR';
  const isPositive = userSummary.netBalance > 0.01;
  const isNegative = userSummary.netBalance < -0.01;
  const isSettled = !isPositive && !isNegative;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Trip Meta Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.02em',
            }}>
              {activeTrip.name}
            </h1>
            <span className="badge badge-neutral" style={{ textTransform: 'none', fontWeight: 600 }}>
              <Users size={12} />
              {tripMembers.length} members
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} color="var(--color-primary)" />
              {activeTrip.destination}
            </span>
            {(activeTrip.start_date || activeTrip.end_date) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} />
                {activeTrip.start_date} {activeTrip.end_date ? `– ${activeTrip.end_date}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Invite Pill */}
        <button
          onClick={onOpenInvite}
          className="btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 'var(--radius-full)',
          }}
          title="Trip invite code"
        >
          <Share2 size={13} color="var(--color-primary)" />
          <span>Code: <strong>{activeTrip.invite_code}</strong></span>
        </button>
      </div>

      {/* Hero Financial Card — The 3-Second Rule Centerpiece */}
      <div className="hero-card">
        <div className="hero-glow-blob" />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left: Total Trip Spending */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              color: '#94a3b8',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <TrendingUp size={16} color="var(--color-primary)" />
              Total Trip Spending
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.03em',
              margin: '6px 0 12px',
              color: '#ffffff',
            }}>
              {formatMoney(animatedTotal, currency)}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
              Across {tripMembers.length} travelers in {activeTrip.destination}
            </div>
          </div>

          {/* Right: Current User Financial Position */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-lg)',
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Your Balance ({currentUser?.name})
                </span>
                {isPositive && (
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    <ArrowUpRight size={12} /> You get back
                  </span>
                )}
                {isNegative && (
                  <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                    <ArrowDownLeft size={12} /> You owe
                  </span>
                )}
                {isSettled && (
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    <CheckCircle2 size={12} /> Settled
                  </span>
                )}
              </div>

              <div style={{
                fontSize: '2rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                margin: '4px 0',
                color: isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : '#ffffff',
              }}>
                {formatMoney(animatedNet, currency, isPositive)}
              </div>
            </div>

            {/* Breakdown: You are owed vs You owe */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 10,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.825rem',
            }}>
              <div>
                <span style={{ color: '#94a3b8' }}>You are owed: </span>
                <strong style={{ color: 'var(--color-success)' }}>
                  {formatMoney(userSummary.youAreOwed, currency)}
                </strong>
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.15)' }} />
              <div>
                <span style={{ color: '#94a3b8' }}>You owe: </span>
                <strong style={{ color: 'var(--color-danger)' }}>
                  {formatMoney(userSummary.youOwe, currency)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 20,
          paddingTop: 18,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <button
            onClick={onOpenAddExpense}
            className="btn btn-primary"
            style={{ flex: '1 1 180px', padding: '12px 18px', fontSize: '0.95rem' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Expense
          </button>

          <button
            onClick={onOpenSettle}
            className="btn btn-secondary"
            style={{
              flex: '1 1 160px',
              padding: '12px 18px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
            }}
          >
            <Handshake size={18} />
            Settle Up
          </button>
        </div>
      </div>
    </div>
  );
}
