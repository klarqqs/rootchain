import type { WalletProvider } from "@/data/wallet";

interface WalletIconProps {
  provider: WalletProvider;
  size?: number;
  className?: string;
}

export function WalletIcon({ provider, size = 24, className = "" }: WalletIconProps) {
  const s = size;
  switch (provider.id) {
    case "freighter":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <defs>
            <linearGradient id={`g-freighter-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7D00FF" />
              <stop offset="100%" stopColor="#3B0099" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#g-freighter-${s})`} />
          <path
            d="M9 11l7 4 7-4M9 11v10l7 4 7-4V11M9 11l7-4 7 4"
            stroke="#fff"
            strokeWidth="1.6"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "lobstr":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <defs>
            <linearGradient id={`g-lobstr-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#33B5FF" />
              <stop offset="100%" stopColor="#0197F6" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#g-lobstr-${s})`} />
          <path
            d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8"
            stroke="#fff"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="2.5" fill="#fff" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <rect width="32" height="32" rx="8" fill={provider.color} />
        </svg>
      );
  }
}
