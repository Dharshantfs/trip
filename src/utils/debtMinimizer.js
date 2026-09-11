import { toPaise, fromPaise } from './currency.js';

/**
 * Calculates net balance for every member in a trip.
 * Formula:
 *   Net Balance = Total Paid - Total Share + Settlements Received - Settlements Paid
 * 
 * Positive (+) balance => User is owed money (creditor)
 * Negative (-) balance => User owes money (debtor)
 * Zero (0) balance => Settled
 */
export function calculateNetBalances(members, expenses = [], settlements = []) {
  const balancePaiseMap = {};

  // Initialize all members with 0
  members.forEach(m => {
    balancePaiseMap[m.id] = 0;
  });

  // 1. Process Expenses
  expenses.forEach(exp => {
    const paidBy = exp.paid_by;
    const amountPaise = toPaise(exp.amount);

    // Add to payer
    if (balancePaiseMap[paidBy] !== undefined) {
      balancePaiseMap[paidBy] += amountPaise;
    }

    // Subtract shares from participants
    if (exp.splits && Array.isArray(exp.splits)) {
      exp.splits.forEach(split => {
        const splitPaise = toPaise(split.amount);
        if (balancePaiseMap[split.user_id] !== undefined) {
          balancePaiseMap[split.user_id] -= splitPaise;
        }
      });
    }
  });

  // 2. Process Settled Payments (status === 'settled')
  settlements.forEach(settle => {
    if (settle.status === 'settled') {
      const settlePaise = toPaise(settle.amount);
      // Payer's debt decreases (balance becomes less negative or more positive)
      if (balancePaiseMap[settle.payer_id] !== undefined) {
        balancePaiseMap[settle.payer_id] += settlePaise;
      }
      // Receiver has received money (balance decreases)
      if (balancePaiseMap[settle.receiver_id] !== undefined) {
        balancePaiseMap[settle.receiver_id] -= settlePaise;
      }
    }
  });

  // Convert back to currency units
  const netBalances = {};
  Object.keys(balancePaiseMap).forEach(userId => {
    netBalances[userId] = fromPaise(balancePaiseMap[userId]);
  });

  return netBalances;
}

/**
 * Greedy Debt Simplification Algorithm (Min-Cash-Flow)
 * Minimizes the total number of transactions needed to settle all balances.
 * 
 * @param {Object} netBalances - Map of userId -> netBalance (in standard units)
 * @returns {Array} List of simplified transactions: [{ from, to, amount }]
 */
export function simplifyDebts(netBalances) {
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([userId, balance]) => {
    const paise = toPaise(balance);
    if (paise < -1) {
      debtors.push({ userId, amount: -paise }); // positive debt
    } else if (paise > 1) {
      creditors.push({ userId, amount: paise });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledPaise = Math.min(debtor.amount, creditor.amount);

    if (settledPaise > 0) {
      transactions.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: fromPaise(settledPaise),
      });

      debtor.amount -= settledPaise;
      creditor.amount -= settledPaise;
    }

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return transactions;
}

/**
 * Calculates financial metrics for current user (The 3-Second Rule)
 */
export function getUserFinancialSummary(userId, netBalances, simplifiedDebts) {
  const userNet = netBalances[userId] || 0;
  
  let youOwe = 0;
  let youAreOwed = 0;

  simplifiedDebts.forEach(t => {
    if (t.from === userId) {
      youOwe += t.amount;
    }
    if (t.to === userId) {
      youAreOwed += t.amount;
    }
  });

  return {
    netBalance: userNet,
    youOwe,
    youAreOwed,
    isSettled: Math.abs(userNet) < 0.01,
  };
}
