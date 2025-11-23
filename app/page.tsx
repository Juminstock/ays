'use client';

import Image from 'next/image';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push('/dashboard');
    }
  }, [ready, authenticated, router]);

  const handleCreateAccount = () => {
    login({
      loginMethods: ['email', 'google', 'twitter'],
    });
  };

  const handleLogin = () => {
    login({
      loginMethods: ['email', 'wallet', 'google', 'twitter'],
    });
  };

  if (!ready) {
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
    <main className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] relative z-10 overflow-hidden">

      <div className="absolute inset-0 bg-mockup" />

      <div className="w-full flex justify-center mt-10">
        <Image
          src="/ays-logo-complete.png"
          alt="Ays logo"
          width={150}
          height={100}
          style={{ width: "auto", height: "auto" }}
          loading="eager"
        />
      </div>

      <section className="flex flex-col items-center text-center mt-50 px-4 max-w-[430px] mx-auto z-10">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Track Your Expenses, Save in USDC, and Invest Easily.
        </h1>

        <p className="text-lg text-white/90 mt-4 max-w-xl">
          Access to a borderless and frictionless financial system open to everyone.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-30 w-full">
          <button
            onClick={handleCreateAccount}
            className="w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Create Account
          </button>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold text-lg border hover:bg-gray-100 transition-colors"
          >
            Login
          </button>
        </div>
      </section>

    </main>
  );
}