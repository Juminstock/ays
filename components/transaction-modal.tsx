// components/transaction-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type TransactionType = 'expense' | 'income' | 'debt' | 'loan' | 'planned';

interface WalletAccount {
  id: string;
  label: string;
  kind: 'fixed' | 'wallet';
  meta?: { address?: string; walletClientType?: string };
}

export interface TransactionRecord {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  date: string;
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  accounts: WalletAccount[];
  onSave: (entry: TransactionRecord) => void;
}

export default function TransactionModal({ open, onClose, accounts, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedAccount((prev) => prev ?? accounts[0]?.id ?? null);
      setAmount('');
      setNote('');
      setType('expense');
      setIsSubmitting(false);
    }
  }, [open, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const value = Number(amount);
    if (isNaN(value) || value <= 0) return;

    setIsSubmitting(true);

    const entry: TransactionRecord = {
      id: crypto.randomUUID(),
      accountId: selectedAccount,
      type,
      amount: Number(value.toFixed(2)),
      note: note || undefined,
      date: new Date().toISOString(),
    };

    try {
      await new Promise((res) => setTimeout(res, 200));
      onSave(entry);

      setAmount('');
      setNote('');
      setType('expense');
      setSelectedAccount(accounts[0]?.id ?? null);
    } catch (err) {
      console.error('Failed saving entry', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--background)] border border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm text-white/70">Account</label>
            <select
              value={selectedAccount ?? ''}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm"
            >
              <option value="expense">Expense (subtract)</option>
              <option value="income">Income (add)</option>
              <option value="debt">Debt (add)</option>
              <option value="loan">Loan (add)</option>
              <option value="planned">Planned Payment (add)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Amount (USD)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm"
              min="0"
              step="0.01"
              inputMode="decimal"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-white/70">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <Button
              type="submit"
              className="flex-1 bg-[var(--color-primary)] text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}