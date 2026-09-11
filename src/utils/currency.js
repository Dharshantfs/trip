/**
 * Currency & Decimal-Safe Financial Utilities for TripSplit
 * All internal math uses integer paise/cents to prevent IEEE-754 precision issues.
 */

export const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)', rate: 1 },
  USD: { symbol: '$', code: 'USD', label: 'US Dollar ($)', rate: 0.012 },
  EUR: { symbol: '€', code: 'EUR', label: 'Euro (€)', rate: 0.011 },
  GBP: { symbol: '£', code: 'GBP', label: 'British Pound (£)', rate: 0.0095 },
};

/**
 * Format monetary amount cleanly with currency symbol
 * @param {number} amount - Amount in standard currency units (e.g. 42850.5)
 * @param {string} currencyCode - e.g. 'INR'
 * @param {boolean} showSign - whether to show '+' for positive numbers
 */
export function formatMoney(amount, currencyCode = 'INR', showSign = false) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const num = Number(amount) || 0;
  const absNum = Math.abs(num);

  // Format with commas
  const formattedAbs = absNum.toLocaleString('en-IN', {
    minimumFractionDigits: absNum % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  if (num < 0) {
    return `-${curr.symbol}${formattedAbs}`;
  }
  if (showSign && num > 0) {
    return `+${curr.symbol}${formattedAbs}`;
  }
  return `${curr.symbol}${formattedAbs}`;
}

/**
 * Safe conversion from display currency to integer paise (cents)
 */
export function toPaise(amount) {
  return Math.round((Number(amount) || 0) * 100);
}

/**
 * Safe conversion from integer paise (cents) to standard float units
 */
export function fromPaise(paise) {
  return (Number(paise) || 0) / 100;
}

/**
 * Divide total amount equally among memberIds with ZERO rounding drift
 * Any remainder paise are allocated sequentially to members.
 */
export function calculateEqualSplits(totalAmount, memberIds) {
  if (!memberIds || memberIds.length === 0) return {};
  const totalPaise = toPaise(totalAmount);
  const count = memberIds.length;
  const basePaise = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;

  const splits = {};
  memberIds.forEach((userId, index) => {
    const allocatedPaise = basePaise + (index < remainder ? 1 : 0);
    splits[userId] = {
      userId,
      amount: fromPaise(allocatedPaise),
      percentage: Number(((allocatedPaise / totalPaise) * 100).toFixed(2)) || 0,
    };
  });
  return splits;
}

/**
 * Validate custom split amounts against total
 */
export function validateCustomSplits(customAmountsMap, totalAmount) {
  const totalPaise = toPaise(totalAmount);
  let sumPaise = 0;

  Object.values(customAmountsMap).forEach(amt => {
    sumPaise += toPaise(amt);
  });

  const diffPaise = totalPaise - sumPaise;
  const isValid = diffPaise === 0;

  return {
    isValid,
    diff: fromPaise(diffPaise),
    sum: fromPaise(sumPaise),
    total: fromPaise(totalPaise),
  };
}

/**
 * Calculate and validate percentage splits
 */
export function calculatePercentageSplits(percentagesMap, totalAmount, memberIds) {
  const totalPaise = toPaise(totalAmount);
  let sumPct = 0;

  memberIds.forEach(id => {
    sumPct += Number(percentagesMap[id]) || 0;
  });

  const isPctValid = Math.abs(sumPct - 100) < 0.01;
  const splits = {};
  let distributedPaise = 0;

  memberIds.forEach((userId, index) => {
    const pct = Number(percentagesMap[userId]) || 0;
    // For the last member, allocate remaining paise to prevent rounding loss
    const paise = index === memberIds.length - 1
      ? (totalPaise - distributedPaise)
      : Math.round((totalPaise * pct) / 100);

    distributedPaise += paise;
    splits[userId] = {
      userId,
      amount: fromPaise(paise),
      percentage: pct,
    };
  });

  return {
    isValid: isPctValid,
    splits,
    sumPercentage: sumPct,
  };
}
