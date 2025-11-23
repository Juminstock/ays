'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Dashboard() {
  const { ready, authenticated, user, logout, exportWallet } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleExportWallet = async () => {
    setIsExporting(true);
    try {
      await exportWallet();
    } catch (error) {
      console.error('Error exporting wallet:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );

  const externalWallets = wallets.filter(
    (wallet) => wallet.walletClientType !== 'privy'
  );

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <Image
            src="/ays-logo-complete.png"
            alt="Ays logo"
            width={120}
            height={80}
            style={{ width: "auto", height: "auto" }}
          />
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
          <h1 className="text-3xl font-bold mb-2">Welcome to Ays! 👋</h1>
          <p className="text-white/70">
            {user?.email?.address || user?.google?.email || 'User'}
          </p>
        </div>

        {embeddedWallet && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Your Embedded Wallet</h2>
                <p className="text-sm text-white/60">
                  Autocustodial wallet created with Privy
                </p>
              </div>
              <div className="bg-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-semibold">
                Privy
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-white/60 mb-1">Wallet Address</p>
              <p className="font-mono text-sm bg-black/30 p-3 rounded-lg break-all">
                {embeddedWallet.address}
              </p>
            </div>

            <button
              onClick={handleExportWallet}
              disabled={isExporting}
              className="w-full px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export Seed Phrase'}
            </button>
            <p className="text-xs text-white/60 mt-2 text-center">
              Keep your seed phrase safe. It is the only way to recover your wallet.
            </p>
          </div>
        )}

        {externalWallets.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold mb-4">Connected Wallets</h2>
            <div className="space-y-3">
              {externalWallets.map((wallet, index) => (
                <div
                  key={index}
                  className="bg-black/30 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs text-white/60 mb-1 capitalize">
                      {wallet.walletClientType.replace('_', ' ')}
                    </p>
                    <p className="font-mono text-sm break-all">
                      {wallet.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/60 mb-1">User ID</p>
              <p className="font-mono text-sm bg-black/30 p-2 rounded break-all">
                {user?.id}
              </p>
            </div>

            {user?.email?.address && (
              <div>
                <p className="text-xs text-white/60 mb-1">Email</p>
                <p className="text-sm bg-black/30 p-2 rounded">
                  {user.email.address}
                </p>
              </div>
            )}

            {user?.google?.email && (
              <div>
                <p className="text-xs text-white/60 mb-1">Google Account</p>
                <p className="text-sm bg-black/30 p-2 rounded">
                  {user.google.email}
                </p>
              </div>
            )}

            {user?.twitter?.username && (
              <div>
                <p className="text-xs text-white/60 mb-1">Twitter</p>
                <p className="text-sm bg-black/30 p-2 rounded">
                  @{user.twitter.username}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-white/60 mb-1">Total Wallets</p>
              <p className="text-sm bg-black/30 p-2 rounded">
                {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}