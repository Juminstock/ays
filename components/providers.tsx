'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      onSuccess={(user, isNewUser) => {
        console.log('User authenticated:', {
          userId: user.id,
          isNewUser,
          email: user.email?.address,
        });

        router.push('/dashboard');
      }}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#696FFD',
          logo: 'https://i.postimg.cc/Y9Sn8LhG/Ays-1000x500-(1).png',
          landingHeader: 'Welcome to Ays!',
          loginMessage: 'Create your account or login to continue',
          walletList: ['metamask', 'coinbase_wallet', 'rainbow', 'wallet_connect'],
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
        },
        loginMethods: ['email', 'wallet', 'google'],
        walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      }}
    >
      {children}
    </PrivyProvider>
  );
}