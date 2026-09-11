import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { 
  Users, 
  UserPlus, 
  Crown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  UserMinus,
  AlertTriangle,
  Check,
  Handshake
} from 'lucide-react';

export function MembersList({ onOpenInvite, onOpenSettle }) {
  const { tripMembers, netBalances, expenses, activeTrip, removeMember } = useTrip();
  const { currentUserId } = useAuth();
  const { addToast } = useToast();

  const [memberToRemove, setMemberToRemove] = useState(null);
  const [unsettledWarningMember, setUnsettledWarningMember] = useState(null);

  const currency = activeTrip?.currency || 'INR';

  // Check if current user is an admin of this trip
  const isCurrentUserAdmin = activeTrip?.created_by === currentUserId || 
    tripMembers.find(m => m.id === currentUserId)?.role === 'admin';

  // Calculate total spent per member
  const memberSpendingMap = {};
  tripMembers.forEach(m => {
    memberSpendingMap[m.id] = 0;
  });

  expenses.forEach(exp => {
    if (memberSpendingMap[exp.paid_by] !== undefined) {
      memberSpendingMap[exp.paid_by] += Number(exp.amount) || 0;
    }
  });

  const handleInitiateRemove = (member) => {
    const balance = netBalances[member.id] || 0;

    // Check outstanding balance: CANNOT remove without paid or outstanding done!
    if (Math.abs(balance) > 0.01) {
      setUnsettledWarningMember({ ...member, balance });
    } else {
      // Balance is 0 -> can be deleted and tallies stay balanced
      setMemberToRemove(member);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    const res = await removeMember(memberToRemove.id);
    if (res.success) {
      addToast({ type: 'success', message: res.message });
    } else {
      addToast({ type: 'error', message: res.message });
    }
    setMemberToRemove(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
          }}>
            Trip Members ({tripMembers.length})
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            People sharing expenses in {activeTrip?.name || 'this trip'} • {isCurrentUserAdmin ? 'Admin controls active' : 'View only'}
          </p>
        </div>

        <button onClick={onOpenInvite} className="btn btn-primary">
          <UserPlus size={18} />
          Invite Friends
        </button>
      </div>

      {/* Members Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 16,
      }}>
        {tripMembers.map(member => {
          const isYou = member.id === currentUserId;
          const isCreator = member.id === activeTrip?.created_by;
          const isAdmin = member.role === 'admin' || isCreator;
          const totalPaid = memberSpendingMap[member.id] || 0;
          const balance = netBalances[member.id] || 0;

          const isOwed = balance > 0.01;
          const owes = balance < -0.01;
          const isSettled = !isOwed && !owes;

          return (
            <div
              key={member.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '18px 20px',
                gap: 16,
                border: isYou ? '1.5px solid var(--color-primary-glow)' : '1px solid var(--border-subtle)',
              }}
            >
              {/* Member Profile */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar user={member} size={48} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {member.name}
                      </span>
                      {isYou && (
                        <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                          You
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {member.email || 'Trip Traveler'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isAdmin && (
                    <span
                      className="badge badge-neutral"
                      style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      title="Trip Creator / Admin"
                    >
                      <Crown size={12} color="#f59e0b" />
                      Admin
                    </span>
                  )}

                  {/* Admin can remove member (except creator) */}
                  {isCurrentUserAdmin && !isCreator && (
                    <button
                      onClick={() => handleInitiateRemove(member)}
                      className="btn-ghost btn-icon"
                      style={{
                        width: 32,
                        height: 32,
                        color: 'var(--color-danger)',
                        borderRadius: 'var(--radius-md)',
                      }}
                      title={`Remove ${member.name} from trip`}
                      aria-label={`Remove ${member.name}`}
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-app)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Paid
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginTop: 2 }}>
                    {formatMoney(totalPaid, currency)}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Current Balance
                  </div>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    color: isOwed ? 'var(--color-success)' : owes ? 'var(--color-danger)' : 'var(--text-muted)',
                    marginTop: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 4,
                  }}>
                    {isOwed && <ArrowUpRight size={14} />}
                    {owes && <ArrowDownLeft size={14} />}
                    {isSettled && <CheckCircle2 size={14} />}
                    <span>{formatMoney(balance, currency, isOwed)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1. Unsettled Balance Warning Dialog (CANNOT REMOVE) */}
      <Modal
        isOpen={!!unsettledWarningMember}
        onClose={() => setUnsettledWarningMember(null)}
        title="Cannot Remove Member"
        subtitle="Outstanding balance must be settled first"
        maxWidth={460}
      >
        {unsettledWarningMember && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--color-danger-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: 16,
              display: 'flex',
              gap: 12,
            }}>
              <AlertTriangle size={24} color="var(--color-danger)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                  Unsettled Balance: {formatMoney(unsettledWarningMember.balance, currency, true)}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 4, lineHeight: 1.4 }}>
                  <strong>{unsettledWarningMember.name}</strong> has active expenses in this trip.
                  To ensure trip accounts tally with 100% mathematical accuracy, members can only be removed once their balance is ₹0.00.
                </p>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Please visit the <strong>Settle Up</strong> tab and record payments to clear their balance before removing them.
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setUnsettledWarningMember(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
              {onOpenSettle && (
                <button
                  onClick={() => {
                    setUnsettledWarningMember(null);
                    onOpenSettle();
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  <Handshake size={16} />
                  Go to Settle Up
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Confirmed Removal Dialog (BALANCE IS 0 / FULLY SETTLED) */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member from Trip"
        subtitle="Confirm removal of settled traveler"
        maxWidth={440}
      >
        {memberToRemove && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--color-success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <CheckCircle2 size={20} color="var(--color-success)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <strong>{memberToRemove.name}</strong> is completely settled (₹0.00 balance).
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Are you sure you want to remove <strong>{memberToRemove.name}</strong> from <strong>{activeTrip?.name}</strong>?
              All trip financial tallies will remain fully balanced.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                onClick={() => setMemberToRemove(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="btn btn-danger"
                style={{ flex: 1.5 }}
              >
                <UserMinus size={16} />
                Remove Member
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
