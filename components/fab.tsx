'use client';

interface FabProps {
  onClick: () => void;
}

export default function Fab({ onClick }: FabProps) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2
        bg-[var(--color-primary)] text-black font-bold
        px-6 py-3 rounded-full shadow-lg shadow-black/40
        hover:scale-105 active:scale-95 transition-all
        z-50
      "
    >
      + Add Entry
    </button>
  );
}