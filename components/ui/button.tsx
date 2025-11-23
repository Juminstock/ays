'use client';

import React from 'react';

export function Button({ className = '', children, ...props }: any) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl font-medium transition-all bg-white/10 hover:bg-white/20 ${className}`}
    >
      {children}
    </button>
  );
}