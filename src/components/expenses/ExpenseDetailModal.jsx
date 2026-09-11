import React from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { formatMoney } from '../../utils/currency';
import { CATEGORIES } from '../../utils/demoData';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { useToast } from '../common/Toast';
import { 
  Calendar, 
  Trash2, 
  Edit3, 
  Tag, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

export function ExpenseDetailModal({ isOpen, onClose, expense, onEdit }) {
  const { tripMembers, activeTrip, deleteExpense } = useTrip();
  const { currentUserId } = useAuth();
  const { addToast } = useToast();

  if (!expense) return null;

  const currency = activeTrip?.currency || 'INR';
  const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[7];
  const payer = tripMembers.find(m => m.id === expense.paid_by) || { name: 'Someone' };

  // Permission: creator of expense, payer, or admin can edit/delete
  const canModify = expense.created_by === currentUserId || expense.paid_by === currentUserId || activeTrip?.created_by === currentUserId;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${expense.description}"?`)) {
      deleteExpense(expense.id);
      addToast({ type: 'info', message: 'Expense deleted' });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense.description}
      subtitle={`Logged on ${expense.date || 'recently'}`}
      maxWidth={480}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Amount Banner */}
        <div style={{
          background: 'var(--bg-app)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: `${category.color}22`,
            color: category.color,
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            <span>{category.emoji}</span>
            <span>{category.name}</span>
          </div>

          <div style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.02em',
          }}>
            {formatMoney(expense.amount, currency)}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
          }}>
            <span>Paid by</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Avatar user={payer} size={22} />
              <strong style={{ color: 'var(--text-main)' }}>{payer.name}</strong>
            </div>
          </div>
        </div>

        {/* Split Breakdown */}
        <div>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            letterSpacing: '0.04em',
            marginBottom: 12,
          }}>
            Split Breakdown ({(expense.splits || []).length} participants)
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            border: '1px solid var(--border-subtle)',
          }}>
            {(expense.splits || []).map(s => {
              const member = tripMembers.find(m => m.id === s.user_id) || { name: 'Member' };
              const isCurrentUser = s.user_id === currentUserId;

              return (
                <div
                  key={s.user_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={member} size={26} />
                    <span style={{ fontSize: '0.875rem', fontWeight: isCurrentUser ? 700 : 500 }}>
                      {member.name} {isCurrentUser ? '(You)' : ''}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {formatMoney(s.amount, currency)}
                    </div>
                    {s.percentage ? (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {s.percentage}%
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: 10,
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 16,
        }}>
          {canModify && (
            <>
              <button
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-secondary"
                style={{
                  color: 'var(--color-danger)',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ flex: canModify ? 1 : 2 }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
