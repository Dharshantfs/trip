import React from 'react';
import { useTrip } from '../../context/TripContext';
import { formatMoney } from '../../utils/currency';
import { Avatar } from '../common/Avatar';
import { 
  Activity, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Handshake, 
  UserPlus, 
  Compass, 
  Clock,
  Mail
} from 'lucide-react';

export function ActivityFeed() {
  const { activities, tripMembers, activeTrip } = useTrip();

  const currency = activeTrip?.currency || 'INR';

  const membersMap = {};
  tripMembers.forEach(m => {
    membersMap[m.id] = m;
  });

  const formatRelativeTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  const getActivityDetails = (act) => {
    const user = membersMap[act.user_id] || { name: 'Someone' };

    switch (act.type) {
      case 'expense_created':
        return {
          icon: <PlusCircle size={16} color="var(--color-primary)" />,
          bg: 'var(--color-primary-light)',
          text: (
            <span>
              <strong>{user.name}</strong> added expense <em>"{act.metadata?.description}"</em> for{' '}
              <strong style={{ color: 'var(--color-primary)' }}>
                {formatMoney(act.metadata?.amount, currency)}
              </strong>
            </span>
          ),
        };
      case 'expense_updated':
        return {
          icon: <Edit size={16} color="#6366f1" />,
          bg: 'rgba(99, 102, 241, 0.15)',
          text: (
            <span>
              <strong>{user.name}</strong> updated expense <em>"{act.metadata?.description}"</em> (
              {formatMoney(act.metadata?.amount, currency)})
            </span>
          ),
        };
      case 'expense_deleted':
        return {
          icon: <Trash2 size={16} color="var(--color-danger)" />,
          bg: 'var(--color-danger-bg)',
          text: (
            <span>
              <strong>{user.name}</strong> deleted expense <em>"{act.metadata?.description}"</em>
            </span>
          ),
        };
      case 'settled':
        const receiver = membersMap[act.metadata?.receiver_id] || { name: 'Someone' };
        return {
          icon: <Handshake size={16} color="var(--color-success)" />,
          bg: 'var(--color-success-bg)',
          text: (
            <span>
              <strong>{user.name}</strong> settled{' '}
              <strong style={{ color: 'var(--color-success)' }}>
                {formatMoney(act.metadata?.amount, currency)}
              </strong>{' '}
              with <strong>{receiver.name}</strong>
            </span>
          ),
        };
      case 'member_joined':
        return {
          icon: <UserPlus size={16} color="#f59e0b" />,
          bg: 'rgba(245, 158, 11, 0.15)',
          text: (
            <span>
              <strong>{user.name}</strong> joined the trip
            </span>
          ),
        };
      case 'member_removed':
        return {
          icon: <Trash2 size={16} color="var(--color-danger)" />,
          bg: 'var(--color-danger-bg)',
          text: (
            <span>
              <strong>{user.name}</strong> removed <strong>{act.metadata?.member_name}</strong> from the trip
            </span>
          ),
        };
      case 'email_invite_sent':
        return {
          icon: <Mail size={16} color="var(--color-info)" />,
          bg: 'var(--color-info-bg)',
          text: (
            <span>
              <strong>{user.name}</strong> sent an email invitation to <strong>{act.metadata?.recipient_name}</strong> ({act.metadata?.email})
            </span>
          ),
        };
      case 'trip_created':
        return {
          icon: <Compass size={16} color="var(--color-primary)" />,
          bg: 'var(--color-primary-light)',
          text: (
            <span>
              <strong>{user.name}</strong> created trip <strong>{act.metadata?.trip_name}</strong>
            </span>
          ),
        };
      default:
        return {
          icon: <Activity size={16} color="var(--text-dim)" />,
          bg: 'var(--bg-card)',
          text: <span>Activity updated</span>,
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em',
        }}>
          Trip Activity Timeline
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Real-time log of expenses, settlements, and member activities
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No activity recorded yet for this trip.
        </div>
      ) : (
        <div className="card" style={{ padding: '24px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {activities.map((act, index) => {
              const details = getActivityDetails(act);
              const user = membersMap[act.user_id];

              return (
                <div
                  key={act.id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Avatar user={user} size={36} />
                    <div style={{
                      position: 'absolute',
                      bottom: -3,
                      right: -3,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}>
                      {details.icon}
                    </div>
                  </div>

                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {details.text}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Clock size={11} />
                      {formatRelativeTime(act.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
