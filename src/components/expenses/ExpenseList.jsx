import React, { useState, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { formatMoney } from '../../utils/currency';
import { CATEGORIES } from '../../utils/demoData';
import { ExpenseCard } from './ExpenseCard';
import { 
  Receipt, 
  Search, 
  Filter, 
  Plus, 
  SlidersHorizontal 
} from 'lucide-react';

export function ExpenseList({ onOpenAddExpense, onSelectExpense }) {
  const { expenses, activeTrip, tripMembers } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

  const currency = activeTrip?.currency || 'INR';

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let list = [...expenses];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(exp => {
        const descMatch = exp.description.toLowerCase().includes(q);
        const payer = tripMembers.find(m => m.id === exp.paid_by);
        const payerMatch = payer?.name.toLowerCase().includes(q);
        return descMatch || payerMatch;
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(exp => exp.category === selectedCategory);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date || b.created_at) - new Date(a.date || a.created_at);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date || a.created_at) - new Date(b.date || b.created_at);
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return list;
  }, [expenses, searchQuery, selectedCategory, sortBy, tripMembers]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Top Header */}
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
            Trip Expenses
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing {filteredExpenses.length} of {expenses.length} expenses • Total: <strong>{formatMoney(totalFilteredAmount, currency)}</strong>
          </p>
        </div>

        <button onClick={onOpenAddExpense} className="btn btn-primary">
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'var(--bg-card)',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: 12, top: 12 }}
            />
            <input
              type="text"
              placeholder="Search expenses by name or payer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 38 }}
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.813rem',
              fontWeight: 600,
              background: selectedCategory === 'all' ? 'var(--color-primary)' : 'var(--bg-app)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
            }}
          >
            All Categories
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.813rem',
                fontWeight: 600,
                background: selectedCategory === cat.id ? `${cat.color}25` : 'var(--bg-app)',
                color: selectedCategory === cat.id ? cat.color : 'var(--text-muted)',
                border: `1px solid ${selectedCategory === cat.id ? cat.color : 'var(--border-subtle)'}`,
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expense Items List */}
      {filteredExpenses.length === 0 ? (
        <div className="card" style={{
          padding: '48px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <Receipt size={36} color="var(--text-dim)" />
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>No matching expenses</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Try adjusting your search query or category filters.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredExpenses.map((exp) => (
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
