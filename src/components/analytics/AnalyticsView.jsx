import React, { useState, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { formatMoney } from '../../utils/currency';
import { CATEGORIES } from '../../utils/demoData';
import { Avatar } from '../common/Avatar';
import { 
  PieChart, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Receipt, 
  Layers 
} from 'lucide-react';

export function AnalyticsView() {
  const { expenses, tripMembers, totalTripExpense, activeTrip } = useTrip();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const currency = activeTrip?.currency || 'INR';

  // 1. Group expenses by Category
  const categoryStats = useMemo(() => {
    const map = {};
    CATEGORIES.forEach(cat => {
      map[cat.id] = { ...cat, total: 0, count: 0 };
    });

    expenses.forEach(e => {
      if (map[e.category]) {
        map[e.category].total += Number(e.amount) || 0;
        map[e.category].count += 1;
      } else {
        if (!map['other']) map['other'] = { ...CATEGORIES[7], total: 0, count: 0 };
        map['other'].total += Number(e.amount) || 0;
        map['other'].count += 1;
      }
    });

    return Object.values(map)
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  // 2. Group expenses by Member (Who spent how much)
  const memberStats = useMemo(() => {
    const map = {};
    tripMembers.forEach(m => {
      map[m.id] = { member: m, total: 0, count: 0 };
    });

    expenses.forEach(e => {
      if (map[e.paid_by]) {
        map[e.paid_by].total += Number(e.amount) || 0;
        map[e.paid_by].count += 1;
      }
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses, tripMembers]);

  // SVG Donut Chart calculation
  const donutSlices = useMemo(() => {
    if (totalTripExpense === 0 || categoryStats.length === 0) return [];
    let cumulativeAngle = 0;
    const radius = 68;
    const cx = 100;
    const cy = 100;

    return categoryStats.map((cat) => {
      const percentage = (cat.total / totalTripExpense) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        emoji: cat.emoji,
        total: cat.total,
        percentage,
        pathData,
      };
    });
  }, [categoryStats, totalTripExpense]);

  const activeDonutInfo = hoveredCategory
    ? donutSlices.find(s => s.id === hoveredCategory)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em',
        }}>
          Trip Analytics & Insights
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Detailed spending patterns, category distribution, and member contributions
        </p>
      </div>

      {/* Metric Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <TrendingUp size={16} color="var(--color-primary)" />
            TOTAL SPENT
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {formatMoney(totalTripExpense, currency)}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Receipt size={16} color="#6366f1" />
            EXPENSE COUNT
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {expenses.length}
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
            <Users size={16} color="#f59e0b" />
            AVG PER PERSON
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', marginTop: 4 }}>
            {formatMoney(tripMembers.length > 0 ? totalTripExpense / tripMembers.length : 0, currency)}
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {/* Category Breakdown (Donut Chart) */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <PieChart size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Spending by Category
            </h2>
          </div>

          {categoryStats.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No expenses recorded to display chart.
            </div>
          ) : (
            <div>
              {/* SVG Donut Visual */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 24 }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {donutSlices.map((slice) => (
                    <path
                      key={slice.id}
                      d={slice.pathData}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={hoveredCategory === slice.id ? '22' : '16'}
                      strokeLinecap="round"
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.2s, filter 0.2s',
                        filter: hoveredCategory === slice.id ? 'brightness(1.2)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredCategory(slice.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  ))}
                </svg>

                {/* Center Donut Text */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  textAlign: 'center',
                }}>
                  {activeDonutInfo ? (
                    <>
                      <span style={{ fontSize: '1.4rem' }}>{activeDonutInfo.emoji}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {activeDonutInfo.name.split(' ')[0]}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                        {formatMoney(activeDonutInfo.total, currency)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        Total
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                        {formatMoney(totalTripExpense, currency)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Legend & Breakdown List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {categoryStats.map(cat => {
                  const pct = totalTripExpense > 0 ? ((cat.total / totalTripExpense) * 100).toFixed(1) : 0;
                  const isHovered = hoveredCategory === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isHovered ? 'var(--bg-card-hover)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {cat.emoji} {cat.name}
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                          {formatMoney(cat.total, currency)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {pct}% ({cat.count} expenses)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Member Spending (Bar Chart) */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Users size={18} color="#6366f1" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              Spending by Person
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {memberStats.map(stat => {
              const maxSpend = memberStats[0]?.total || 1;
              const barPercent = Math.max((stat.total / maxSpend) * 100, 3);
              const sharePercent = totalTripExpense > 0 ? ((stat.total / totalTripExpense) * 100).toFixed(1) : 0;

              return (
                <div key={stat.member.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar user={stat.member} size={24} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stat.member.name}</span>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sharePercent}%</span>
                      <strong style={{ fontSize: '0.9rem' }}>{formatMoney(stat.total, currency)}</strong>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    borderRadius: 9999,
                    background: 'var(--bg-app)',
                    overflow: 'hidden',
                  }}>
                    <div
                      style={{
                        width: `${barPercent}%`,
                        height: '100%',
                        borderRadius: 9999,
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, #6366f1 100%)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
