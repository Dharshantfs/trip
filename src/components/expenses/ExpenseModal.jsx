import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { CATEGORIES } from '../../utils/demoData';
import { 
  formatMoney, 
  calculateEqualSplits, 
  validateCustomSplits, 
  calculatePercentageSplits 
} from '../../utils/currency';
import { 
  Check, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  Percent, 
  Sliders 
} from 'lucide-react';

export function ExpenseModal({ isOpen, onClose, editingExpense = null }) {
  const { tripMembers, activeTrip, addExpense, updateExpense } = useTrip();
  const { currentUserId } = useAuth();
  const { addToast } = useToast();

  const currency = activeTrip?.currency || 'INR';

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState('');
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom' | 'percentage'

  // Splitting states
  const [selectedMembers, setSelectedMembers] = useState([]); // for equal split
  const [customAmounts, setCustomAmounts] = useState({}); // userId -> amount string
  const [percentages, setPercentages] = useState({}); // userId -> percentage string
  const [formError, setFormError] = useState('');

  // Initialize or populate on open/edit
  useEffect(() => {
    if (isOpen) {
      setFormError('');
      if (editingExpense) {
        setDescription(editingExpense.description);
        setAmount(editingExpense.amount.toString());
        setCategory(editingExpense.category);
        setPaidBy(editingExpense.paid_by);
        setDate(editingExpense.date || new Date().toISOString().split('T')[0]);

        const splits = editingExpense.splits || [];
        const participantIds = splits.map(s => s.user_id);
        setSelectedMembers(participantIds);

        // Detect or populate splits
        const cMap = {};
        const pMap = {};
        splits.forEach(s => {
          cMap[s.user_id] = s.amount.toString();
          pMap[s.user_id] = s.percentage ? s.percentage.toString() : '';
        });
        setCustomAmounts(cMap);
        setPercentages(pMap);
        setSplitType('equal');
      } else {
        // Defaults for new expense
        setDescription('');
        setAmount('');
        setCategory('food');
        setPaidBy(currentUserId || tripMembers[0]?.id || '');
        setDate(new Date().toISOString().split('T')[0]);
        const allIds = tripMembers.map(m => m.id);
        setSelectedMembers(allIds);

        // Initialize equal distribution placeholders
        const cMap = {};
        const pMap = {};
        const defaultPct = tripMembers.length > 0 ? (100 / tripMembers.length).toFixed(1) : 0;
        allIds.forEach(id => {
          cMap[id] = '';
          pMap[id] = defaultPct;
        });
        setCustomAmounts(cMap);
        setPercentages(pMap);
        setSplitType('equal');
      }
    }
  }, [isOpen, editingExpense, tripMembers, currentUserId]);

  const numAmount = Number(amount) || 0;

  // Toggle member inclusion for equal split
  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      if (selectedMembers.length <= 1) {
        setFormError('At least one member must be included in the split.');
        return;
      }
      setSelectedMembers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedMembers(prev => [...prev, userId]);
    }
    setFormError('');
  };

  // Select all or clear members
  const selectAllMembers = () => {
    setSelectedMembers(tripMembers.map(m => m.id));
    setFormError('');
  };

  // Handle submit with full validation
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError('Please enter an expense description.');
      return;
    }

    if (!amount || numAmount <= 0) {
      setFormError('Enter a valid expense amount.');
      return;
    }

    if (!paidBy) {
      setFormError('Please select who paid for this expense.');
      return;
    }

    let finalSplits = [];

    if (splitType === 'equal') {
      if (selectedMembers.length === 0) {
        setFormError('Please select at least one person to split with.');
        return;
      }
      const splitMap = calculateEqualSplits(numAmount, selectedMembers);
      finalSplits = Object.values(splitMap).map(s => ({
        user_id: s.userId,
        amount: s.amount,
        percentage: s.percentage,
      }));
    } else if (splitType === 'custom') {
      const { isValid, diff, sum } = validateCustomSplits(customAmounts, numAmount);
      if (!isValid) {
        setFormError(
          `The split doesn't match total! Total: ${formatMoney(numAmount, currency)}, Sum: ${formatMoney(sum, currency)} (Diff: ${formatMoney(diff, currency)})`
        );
        return;
      }
      finalSplits = Object.entries(customAmounts)
        .filter(([_, val]) => Number(val) > 0)
        .map(([uid, val]) => ({
          user_id: uid,
          amount: Number(val),
          percentage: Number(((Number(val) / numAmount) * 100).toFixed(2)),
        }));
    } else if (splitType === 'percentage') {
      const activeIds = tripMembers.map(m => m.id);
      const { isValid, splits, sumPercentage } = calculatePercentageSplits(percentages, numAmount, activeIds);
      if (!isValid) {
        setFormError(`Total percentage must equal 100%. Current sum: ${sumPercentage.toFixed(1)}%`);
        return;
      }
      finalSplits = Object.values(splits).map(s => ({
        user_id: s.userId,
        amount: s.amount,
        percentage: s.percentage,
      }));
    }

    const payload = {
      description: description.trim(),
      amount: numAmount,
      category,
      paid_by: paidBy,
      date,
      splits: finalSplits,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
      addToast({ type: 'success', message: 'Expense updated successfully!' });
    } else {
      addExpense(payload);
      addToast({ type: 'success', message: `Added "${payload.description}" for ${formatMoney(numAmount, currency)}` });
    }

    onClose();
  };

  // Equal split per person calculation preview
  const perPersonEqual = selectedMembers.length > 0 && numAmount > 0 
    ? (numAmount / selectedMembers.length).toFixed(2) 
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      subtitle={`Log an expense for ${activeTrip?.name || 'this trip'}`}
      maxWidth={540}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {formError && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{formError}</span>
          </div>
        )}

        {/* Amount (Hero input) */}
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Amount ({currency})
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: 16,
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
            }}>
              {currency === 'INR' ? '₹' : '$'}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              style={{
                paddingLeft: 42,
                fontSize: '1.4rem',
                fontWeight: 700,
                fontFamily: 'var(--font-heading)',
              }}
              autoFocus={!editingExpense}
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label">Expense Description</label>
          <input
            type="text"
            required
            placeholder="e.g. Fisherman's Wharf Dinner, Taxi to Beach..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Category Picker (Interactive horizontal scroll pills) */}
        <div className="form-group" style={{ marginBottom: 4 }}>
          <label className="form-label">Category</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}>
            {CATEGORIES.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                    background: isSelected ? `${cat.color}22` : 'var(--bg-card)',
                    color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cat.emoji}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{cat.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payer & Date Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Paid By</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="form-select"
            >
              {tripMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.id === currentUserId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Splitting Tabs */}
        <div style={{
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-lg)',
          padding: 16,
          border: '1px solid var(--border-subtle)',
          marginTop: 4,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Split Method
            </label>

            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              padding: 2,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className="btn btn-sm"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  background: splitType === 'equal' ? 'var(--color-primary)' : 'transparent',
                  color: splitType === 'equal' ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                Equal
              </button>
              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className="btn btn-sm"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  background: splitType === 'custom' ? 'var(--color-primary)' : 'transparent',
                  color: splitType === 'custom' ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                Exact Amounts
              </button>
              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className="btn btn-sm"
                style={{
                  padding: '4px 10px',
                  fontSize: '0.78rem',
                  background: splitType === 'percentage' ? 'var(--color-primary)' : 'transparent',
                  color: splitType === 'percentage' ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                Percentage
              </button>
            </div>
          </div>

          {/* Equal Split Options */}
          {splitType === 'equal' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}>
                <span>
                  Split among <strong>{selectedMembers.length}</strong> people:
                  {numAmount > 0 && selectedMembers.length > 0 && (
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, marginLeft: 4 }}>
                      (~{formatMoney(perPersonEqual, currency)} each)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={selectAllMembers}
                  className="btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', padding: '2px 6px', color: 'var(--color-primary)' }}
                >
                  Select All
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {tripMembers.map(m => {
                  const isChecked = selectedMembers.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: isChecked ? 'var(--bg-card-hover)' : 'transparent',
                        border: `1px solid ${isChecked ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar user={m} size={24} />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                          {m.name} {m.id === currentUserId ? '(You)' : ''}
                        </span>
                      </div>
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: `1.5px solid ${isChecked ? 'var(--color-primary)' : 'var(--text-dim)'}`,
                        background: isChecked ? 'var(--color-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Split Inputs */}
          {splitType === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tripMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={m} size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {m.name} {m.id === currentUserId ? '(You)' : ''}
                    </span>
                  </div>
                  <div style={{ width: 110, position: 'relative' }}>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={customAmounts[m.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomAmounts(prev => ({ ...prev, [m.id]: val }));
                      }}
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '0.875rem', textAlign: 'right' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Percentage Split Inputs */}
          {splitType === 'percentage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tripMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar user={m} size={24} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {m.name} {m.id === currentUserId ? '(You)' : ''}
                    </span>
                  </div>
                  <div style={{ width: 100, position: 'relative' }}>
                    <span style={{ position: 'absolute', right: 10, top: 7, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      %
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={percentages[m.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPercentages(prev => ({ ...prev, [m.id]: val }));
                      }}
                      className="form-input"
                      style={{ padding: '6px 24px 6px 10px', fontSize: '0.875rem', textAlign: 'right' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1.5 }}
          >
            {editingExpense ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
