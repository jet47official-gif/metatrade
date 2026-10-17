import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function PromoBanner() {
  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-10 overflow-hidden bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600 border-b border-gold-700/50 shadow-lg shadow-gold-500/20">
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-white/25 blur-md animate-shimmer" />
      <div className="relative h-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-center gap-2 sm:gap-3 text-zinc-950">
        <Gift className="w-4 h-4 flex-shrink-0" />
        <p className="text-[11px] sm:text-sm font-extrabold uppercase tracking-wider sm:tracking-widest whitespace-nowrap">
          $10 TO $500 <span className="font-black">Deposit Bonus</span>
        </p>
        <Link
          to="/dashboard/wallet"
          className="flex-shrink-0 px-3 py-1 rounded-full bg-zinc-950 text-gold-400 text-[10px] sm:text-xs font-bold uppercase tracking-wide hover:bg-zinc-800 transition-colors"
        >
          Deposit Now
        </Link>
      </div>
    </div>
  );
}
