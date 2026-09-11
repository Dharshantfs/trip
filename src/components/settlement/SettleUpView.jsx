import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';
import { 
  Handshake, 
  CheckCircle2, 
  ArrowRight, 
  History, 
  Check, 
  Sparkles,
  DollarSign
} from 'lucide-react';

export function SettleUpView() {
  const { 
    simplifiedDebts, 
    tripMembers, 
    activeTrip, 
    settleDebt, 
    settlements, 
    userSummary 
  } = useTrip();
  const { currentUserId, currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [settlingItem, setSettlingItem] = useState(null);

  const currency = activeTrip?.currency || 'INR';

  const membersMap = {};
  tripMembers.forEach(m => {
    membersMap[m.id] = m;
  });

  const handleSettle = (debt) => {
    setSettlingItem(debt);

    // Blast confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
      });
    } catch {}

    const payer = membersMap[debt.from] || { name: 'Member' };
    const receiver = membersMap[debt.to] || { name: 'Member' };

    settleDebt({
      payer_id: debt.from,
      receiver_id: debt.to,
      amount: debt.amount,
    });

    addToast({
      type: 'success',
      message: `Marked as settled: ${payer.name} paid ${formatMoney(debt.amount, currency)} to ${receiver.name} 🎉`,
    });

    setSettlingItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em',
        }}>
          Settle Balances
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Smart debt simplification to resolve all trip expenses with minimum transactions
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        gap: 24,
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 0',
            borderBottom: activeTab === 'pending' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'pending' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
          }}
        >
          <Handshake size={18} />
          <span>Pending Settlements ({simplifiedDebts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 0',
            borderBottom: activeTab === 'history' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
          }}
        >
          <History size={18} />
          <span>Settlement History ({settlements.length})</span>
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User Status Card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            borderColor: 'var(--color-primary-glow)',
            padding: '18px 22px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Your Current Position ({currentUser?.name})
                </span>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: userSummary.netBalance > 0 ? 'var(--color-success)' : userSummary.netBalance < 0 ? 'var(--color-danger)' : 'var(--text-main)',
                  marginTop: 2,
                }}>
                  {userSummary.netBalance > 0
                    ? `You are owed ${formatMoney(userSummary.netBalance, currency)}`
                    : userSummary.netBalance < 0
                    ? `You owe ${formatMoney(Math.abs(userSummary.netBalance), currency)}`
                    : 'You are completely settled up!'}
                </div>
              </div>

              {userSummary.isSettled ? (
                <div className="badge badge-success" style={{ padding: '6px 14px' }}>
                  <CheckCircle2 size={16} />
                  Zero Balance
                </div>
              ) : null}
            </div>
          </div>

          {/* Pending Settlements List */}
          {simplifiedDebts.length === 0 ? (
            <div className="card" style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
              }}>
                <Sparkles size={32} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                Everyone is settled up 🎉
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 360 }}>
                No one owes any money to anyone else in this trip. All balances are at zero!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {simplifiedDebts.map((debt, index) => {
                const payer = membersMap[debt.from] || { name: 'Member', id: debt.from };
                const receiver = membersMap[debt.to] || { name: 'Member', id: debt.to };

                const isYouPayer = debt.from === currentUserId;
                const isYouReceiver = debt.to === currentUserId;

                return (
                  <div
                    key={`${debt.from}_${debt.to}_${index}`}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      gap: 14,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Transfer Visual */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 240 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar user={payer} size={36} />
                        <div>
                          <div style={{
                            fontSize: '0.925rem',
                            fontWeight: 700,
                            color: isYouPayer ? 'var(--color-danger)' : 'var(--text-main)',
                          }}>
                            {isYouPayer ? 'You' : payer.name}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Pays
                          </span>
                        </div>
                      </div>

                      <ArrowRight size={20} color="var(--color-primary)" />

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar user={receiver} size={36} />
                        <div>
                          <div style={{
                            fontSize: '0.925rem',
                            fontWeight: 700,
                            color: isYouReceiver ? 'var(--color-success)' : 'var(--text-main)',
                          }}>
                            {isYouReceiver ? 'You' : receiver.name}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Receives
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Mark Paid Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
                      <div style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text-main)',
                      }}>
                        {formatMoney(debt.amount, currency)}
                      </div>

                      <button
                        onClick={() => handleSettle(debt)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px' }}
                      >
                        <Check size={16} strokeWidth={2.5} />
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Settlement History Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {settlements.length === 0 ? (
            <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No payments have been recorded yet.
            </div>
          ) : (
            settlements.map((s) => {
              const payer = membersMap[s.payer_id] || { name: 'Member' };
              const receiver = membersMap[s.receiver_id] || { name: 'Member' };

              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={18} strokeWidth={2.5} />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        <strong>{payer.name}</strong> paid <strong>{receiver.name}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        {new Date(s.paid_at || s.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--color-success)',
                  }}>
                    {formatMoney(s.amount, currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
