import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { formatMoney } from '../../utils/currency';
import { CATEGORIES } from '../../utils/demoData';
import { Avatar } from '../common/Avatar';
import { 
  Utensils, 
  Hotel, 
  Car, 
  Ticket, 
  Fuel, 
  ShoppingBag, 
  Sparkles, 
  Package, 
  Calendar,
  ChevronRight
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Hotel,
  Car,
  Ticket,
  Fuel,
  ShoppingBag,
  Sparkles,
  Package,
};

export function ExpenseCard({ expense, onClick }) {
  const { currentUserId } = useAuth();
  const { tripMembers, activeTrip } = useTrip();

  const currency = activeTrip?.currency || 'INR';

  // Find category details
  const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[7];
  const IconComponent = ICON_MAP[category.icon] || Package;

  // Find payer
  const payer = tripMembers.find(m => m.id === expense.paid_by) || { name: 'Someone' };
  const isPayer = expense.paid_by === currentUserId;

  // Calculate current user's share
  const userSplit = (expense.splits || []).find(s => s.user_id === currentUserId);
  const userShareAmount = userSplit ? Number(userSplit.amount) : 0;
  const isParticipant = !!userSplit;

  // Net impact for current user:
  // If user paid: user gets (total - userShare) back
  // If someone else paid and user participates: user owes userShare
  let userStatusText = '';
  let userStatusColor = 'var(--text-muted)';

  if (isPayer) {
    const lentAmount = expense.amount - userShareAmount;
    if (lentAmount > 0) {
      userStatusText = `You lent ${formatMoney(lentAmount, currency)}`;
      userStatusColor = 'var(--color-success)';
    } else {
      userStatusText = 'You paid for yourself';
    }
  } else if (isParticipant && userShareAmount > 0) {
    userStatusText = `You borrowed ${formatMoney(userShareAmount, currency)}`;
    userStatusColor = 'var(--color-danger)';
  } else {
    userStatusText = 'Not involved';
  }

  return (
    <div
      className="card card-interactive"
      onClick={() => onClick(expense)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        gap: 12,
      }}
    >
      {/* Left: Category Icon & Main Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: `${category.color}1c`,
            border: `1px solid ${category.color}35`,
            color: category.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconComponent size={22} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: '0.975rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {expense.description}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: 3,
            flexWrap: 'wrap',
          }}>
            <span>Paid by <strong style={{ color: isPayer ? 'var(--color-primary)' : 'var(--text-main)' }}>{isPayer ? 'You' : payer.name}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} />
              {expense.date || 'Today'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Amount & Your Share */}
      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <div style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
          }}>
            {formatMoney(expense.amount, currency)}
          </div>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: userStatusColor,
            marginTop: 2,
          }}>
            {userStatusText}
          </div>
        </div>

        <ChevronRight size={16} color="var(--text-dim)" />
      </div>
    </div>
  );
}
