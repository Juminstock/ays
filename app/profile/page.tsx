'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import md5 from 'blueimp-md5';
import { useEffect, useState } from 'react';

function getGravatarUrl(email?: string) {
  if (!email) return `https://www.gravatar.com/avatar/?d=identicon&s=200`;
  const cleanEmail = email.trim().toLowerCase();
  const hash = md5(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
}

export default function Profile() {
  const { ready, authenticated, user, logout, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  const [copyWalletOk, setCopyWalletOk] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) router.push('/');
  }, [ready, authenticated, router]);

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const externalWallets = wallets.filter((w) => w.walletClientType !== 'privy');

  const email = user?.email?.address || user?.google?.email || null;
  const displayName = email || user?.google?.name || user?.twitter?.username || 'User';
  const gravatar = getGravatarUrl(email || undefined);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleExportWallet = async () => {
    try {
      await exportWallet();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleCopyWalletAddress = async () => {
    if (!embeddedWallet?.address) return;

    try {
      await navigator.clipboard.writeText(embeddedWallet.address);
      setCopyWalletOk(true);
      setTimeout(() => setCopyWalletOk(false), 2500);
    } catch (err) {
      console.error("Copy wallet address failed:", err);
    }
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-purple-600">
            <Image
              src={gravatar}
              alt="Profile avatar"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>

          <h1 className="text-2xl font-bold mb-2">
            {displayName.split('@')[0]}
          </h1>
          <p className="text-sm text-white/60">{displayName}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">USDC Savings Performance</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-xs text-white/60 mb-1">Current Balance</p>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-green-400 mt-1">USDC</p>
            </div>

            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-xs text-white/60 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-white/60 mt-1">All time</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
              <span className="text-sm text-white/70">Monthly APY</span>
              <span className="text-sm font-semibold text-green-400">~5.2%</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
              <span className="text-sm text-white/70">This Month</span>
              <span className="text-sm font-semibold">$0.00</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
              <span className="text-sm text-white/70">Last 30 Days</span>
              <span className="text-sm font-semibold">$0.00</span>
            </div>
          </div>
        </div>

        {embeddedWallet && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Your Embedded Wallet</h2>

            <div className="bg-black/20 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="w-3/4">
                  <p className="text-xs text-white/60 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm break-all">
                    {embeddedWallet.address}
                  </p>
                </div>

                <button
                  onClick={handleCopyWalletAddress}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all
                  ${copyWalletOk
                    ? "bg-green-600 text-white scale-105 shadow-lg"
                    : "bg-white/5 text-white/90 hover:bg-white/10"
                  }`}
                >
                  {copyWalletOk ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 8-8" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-white/60">
                This is your autocustodial wallet. You can export your seed phrase at any time.
              </p>
            </div>
          </div>
        )}

        {externalWallets.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <h2 className="text-lg font-bold mb-4">Connected Wallets</h2>
            <div className="space-y-3">
              {externalWallets.map((wallet, i) => (
                <div key={i} className="bg-black/20 rounded-xl p-4">
                  <p className="text-xs text-white/60 capitalize">
                    {wallet.walletClientType.replace('_', ' ')}
                  </p>
                  <p className="font-mono text-sm break-all">{wallet.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4">Account Actions</h2>

          <div className="space-y-3">

            <button
              onClick={handleExportWallet}
              disabled={!embeddedWallet}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all
                ${
                  exportSuccess
                    ? "bg-green-600 text-white"
                    : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90"
                }
                disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="flex items-center gap-3">
                {exportSuccess ? "✓ Export Completed" : "Export Seed Phrase"}
              </span>

                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" style={{ transform: "rotate(-45deg)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>

            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <span>Logout</span>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}