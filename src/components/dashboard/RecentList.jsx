import React from 'react';
import { useTrip } from '../../context/TripContext';
import { ExpenseCard } from '../expenses/ExpenseCard';
import { Receipt, Plus, ArrowRight } from 'lucide-react';

export function RecentList({ onOpenAddExpense, onViewAllExpenses, onSelectExpense }) {
  const { expenses } = useTrip();

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            Recent Expenses
          </h2>
        </div>

        {expenses.length > 0 && (
          <button
            onClick={onViewAllExpenses}
            className="btn-ghost btn-sm"
            style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <span>View All ({expenses.length})</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="card" style={{
          padding: '40px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}>
            <Receipt size={28} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No expenses yet</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 320 }}>
            Add your first expense and we’ll automatically calculate who owes what and simplify balances!
          </p>
          <button onClick={onOpenAddExpense} className="btn btn-primary" style={{ marginTop: 8 }}>
            <Plus size={16} />
            Add First Expense
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onClick={onSelectExpense}
            />
          ))}
        </div>
      )}
    </div>
  );
}
