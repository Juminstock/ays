'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/navbar';
import Fab from '@/components/fab';
import TransactionModal from '@/components/transaction-modal';

type FixedAccountKey = 'cash' | 'offramp' | 'savings' | 'investments';

type WalletAccount = {
  id: string;
  label: string;
  kind: 'fixed' | 'wallet';
  meta?: { address?: string; walletClientType?: string };
};

type TransactionRecord = {
  id: string;
  accountId: string;
  type: 'expense' | 'income' | 'debt' | 'loan' | 'planned';
  amount: number;
  note?: string;
  date: string;
};

export default function Dashboard() {
  const { ready, authenticated, user, logout, exportWallet } = usePrivy();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [balances, setBalances] = useState<Record<string, number>>({});
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const accounts = useMemo<WalletAccount[]>(() => {
    const fixed: WalletAccount[] = [
      { id: 'cash', label: 'Cash', kind: 'fixed' },
      { id: 'offramp', label: 'OffRamp', kind: 'fixed' },
      { id: 'savings', label: 'Savings', kind: 'fixed' },
      { id: 'investments', label: 'Investments', kind: 'fixed' },
    ];

    const linked = (user?.linkedAccounts ?? []) as any[];

    const walletAccounts: WalletAccount[] = linked
      .filter((a) => a.type === 'wallet' && a.address)
      .map((a) => ({
        id: `wallet:${a.address}`,
        label: `${a.walletClientType ?? 'Wallet'} (${a.address.slice(0, 6)}…)`,
        kind: 'wallet' as const,
        meta: { address: a.address, walletClientType: a.walletClientType },
      }));

    return [...fixed, ...walletAccounts];
  }, [user]);

  const balancesStorageKey = useMemo(() => {
    return `ays:balances:${user?.id ?? 'anonymous'}`;
  }, [user?.id]);

  const txStorageKey = useMemo(() => {
    return `ays:transactions:${user?.id ?? 'anonymous'}`;
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      const init: Record<string, number> = {};
      ['cash', 'offramp', 'savings', 'investments'].forEach((k) => (init[k] = 0));
      setBalances(init);
      setTransactions([]);
      return;
    }

    try {
      const raw = localStorage.getItem(balancesStorageKey);
      if (raw) {
        setBalances(JSON.parse(raw));
      } else {
        const init: Record<string, number> = {};
        accounts.forEach((a) => {
          init[a.id] = 0;
        });
        localStorage.setItem(balancesStorageKey, JSON.stringify(init));
        setBalances(init);
      }

      const rawTx = localStorage.getItem(txStorageKey);
      if (rawTx) {
        setTransactions(JSON.parse(rawTx));
      }
    } catch (err) {
      console.error('Failed reading local balances/transactions', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, balancesStorageKey, txStorageKey]);

  const persistBalances = (next: Record<string, number>) => {
    try {
      localStorage.setItem(balancesStorageKey, JSON.stringify(next));
    } catch (err) {
      console.error('Failed persisting balances', err);
    }
  };

  const persistTransactions = (next: TransactionRecord[]) => {
    try {
      localStorage.setItem(txStorageKey, JSON.stringify(next));
    } catch (err) {
      console.error('Failed persisting transactions', err);
    }
  };

  const handleSaveTransaction = (entry: TransactionRecord) => {
    const nextTx = [entry, ...transactions].slice(0, 200);
    setTransactions(nextTx);
    persistTransactions(nextTx);

    const multiplier = entry.type === 'expense' ? -1 : 1;
    const current = balances[entry.accountId] ?? 0;
    const nextBalance = Number((current + multiplier * entry.amount).toFixed(2));

    const nextBalances = { ...balances, [entry.accountId]: nextBalance };
    setBalances(nextBalances);
    persistBalances(nextBalances);
  };

  const getBalanceForFixed = (id: FixedAccountKey) => {
    return balances[id] ?? 0;
  };

  if (!ready || !authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      <div className="absolute inset-0 bg-mockup" />

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-white/60 uppercase font-semibold">Cash</span>
            </div>
            <p className="text-2xl font-bold">${getBalanceForFixed('cash').toFixed(2)}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-white/60 uppercase font-semibold">OffRamp</span>
            </div>
            <p className="text-2xl font-bold">${getBalanceForFixed('offramp').toFixed(2)}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs text-white/60 uppercase font-semibold">Savings</span>
            </div>
            <p className="text-2xl font-bold">${getBalanceForFixed('savings').toFixed(2)}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xs text-white/60 uppercase font-semibold">Investments</span>
            </div>
            <p className="text-2xl font-bold">${getBalanceForFixed('investments').toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">Balance</h2>
              <button className="text-white/60 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/60 mb-1">TODAY</p>
            <p className="text-4xl font-bold mb-4">
              ${(
                getBalanceForFixed('cash') +
                getBalanceForFixed('offramp') +
                getBalanceForFixed('savings') +
                getBalanceForFixed('investments')
              ).toFixed(2)}
            </p>
            <button className="text-sm text-[var(--color-primary)] font-semibold hover:underline">
              Show more
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">Cash Flow</h2>
              <button className="text-white/60 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/60 mb-1">THIS MONTH</p>
            <p className="text-4xl font-bold mb-2">$ 0,00</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Income</span>
                <span className="text-sm font-semibold">$ 0,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Expenses</span>
                <span className="text-sm font-semibold">$ 0,00</span>
              </div>
            </div>
            <button className="text-sm text-[var(--color-primary)] font-semibold hover:underline">
              Show more
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold">Debts & Loans</h2>
              <button className="text-white/60 hover:text-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-white/60 mb-1">TOTAL</p>
            <p className="text-4xl font-bold mb-2">$ 0,00</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Debts</span>
                <span className="text-sm font-semibold text-red-400">$ 0,00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Loans</span>
                <span className="text-sm font-semibold text-green-400">$ 0,00</span>
              </div>
            </div>
            <button className="text-sm text-[var(--color-primary)] font-semibold hover:underline">
              Show more
            </button>
          </div>
        </div>

      </div>

      <Fab onClick={() => setIsModalOpen(true)} />

      <TransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts}
        onSave={(entry) => {
          handleSaveTransaction(entry);
          setIsModalOpen(false);
        }}
      />
    </main>
  );
}