'use client';

import React from 'react';

export function Dialog({ open, onOpenChange, children }: any) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = '', children }: any) {
  return (
    <div className={`bg-[var(--background)] border border-white/10 p-6 rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function DialogHeader({ children }: any) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: any) {
  return <h2 className="text-xl font-bold">{children}</h2>;
}