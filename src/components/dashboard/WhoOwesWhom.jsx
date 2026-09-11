import React from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { Avatar } from '../common/Avatar';
import { ArrowRight, CheckCircle2, Handshake } from 'lucide-react';

export function WhoOwesWhom({ onOpenSettle }) {
  const { simplifiedDebts, tripMembers, activeTrip } = useTrip();
  const { currentUserId } = useAuth();

  const currency = activeTrip?.currency || 'INR';

  // Map member details for fast lookup
  const membersMap = {};
  tripMembers.forEach(m => {
    membersMap[m.id] = m;
  });

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Handshake size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Who Owes Whom
          </h2>
        </div>
        <button
          onClick={onOpenSettle}
          className="btn-ghost btn-sm"
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          Settle All →
        </button>
      </div>

      {simplifiedDebts.length === 0 ? (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <CheckCircle2 size={36} color="var(--color-success)" />
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Everyone is settled up 🎉</div>
          <div style={{ fontSize: '0.85rem' }}>No pending debts for this trip right now.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {simplifiedDebts.slice(0, 4).map((debt, index) => {
            const payer = membersMap[debt.from] || { name: 'Member', id: debt.from };
            const receiver = membersMap[debt.to] || { name: 'Member', id: debt.to };

            const isYouPayer = debt.from === currentUserId;
            const isYouReceiver = debt.to === currentUserId;

            return (
              <div
                key={`${debt.from}_${debt.to}_${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {/* Payer and Receiver */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar user={payer} size={28} />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: isYouPayer ? 700 : 500,
                      color: isYouPayer ? 'var(--color-danger)' : 'var(--text-main)',
                    }}>
                      {isYouPayer ? 'You' : payer.name}
                    </span>
                  </div>

                  <ArrowRight size={14} color="var(--text-dim)" style={{ flexShrink: 0 }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Avatar user={receiver} size={28} />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: isYouReceiver ? 700 : 500,
                      color: isYouReceiver ? 'var(--color-success)' : 'var(--text-main)',
                    }}>
                      {isYouReceiver ? 'You' : receiver.name}
                    </span>
                  </div>
                </div>

                {/* Amount & Quick Settle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    fontSize: '0.975rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: isYouPayer ? 'var(--color-danger)' : isYouReceiver ? 'var(--color-success)' : 'var(--text-main)',
                  }}>
                    {formatMoney(debt.amount, currency)}
                  </div>

                  <button
                    onClick={onOpenSettle}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    Settle
                  </button>
                </div>
              </div>
            );
          })}

          {simplifiedDebts.length > 4 && (
            <button
              onClick={onOpenSettle}
              className="btn-ghost btn-sm"
              style={{ textAlign: 'center', marginTop: 4 }}
            >
              + {simplifiedDebts.length - 4} more settlement paths...
            </button>
          )}
        </div>
      )}
    </div>
  );
}
