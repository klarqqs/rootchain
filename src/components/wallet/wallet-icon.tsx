import type { WalletProvider } from "@/data/wallet";

interface WalletIconProps {
  provider: WalletProvider;
  size?: number;
  className?: string;
}

/**
 * Bespoke logos for each provider — kept inline as SVG so the modal
 * does not depend on remote assets.
 */
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
          <path d="M9 11l7 4 7-4M9 11v10l7 4 7-4V11M9 11l7-4 7 4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        </svg>
      );
    case "albedo":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <defs>
            <radialGradient id={`g-albedo-${s}`} cx="50%" cy="50%">
              <stop offset="0%" stopColor="#FFB088" />
              <stop offset="100%" stopColor="#FF6B35" />
            </radialGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#g-albedo-${s})`} />
          <circle cx="16" cy="16" r="5" fill="#fff" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d, i) => (
            <line key={i} x1="16" y1="16" x2={16 + Math.cos((d * Math.PI) / 180) * 11} y2={16 + Math.sin((d * Math.PI) / 180) * 11} stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
          ))}
        </svg>
      );
    case "xbull":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <defs>
            <linearGradient id={`g-xbull-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D9A0" />
              <stop offset="100%" stopColor="#00B894" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="8" fill={`url(#g-xbull-${s})`} />
          <path d="M8 12c1-2 3-3 4-3l1 2c1 0 2 1 3 1s2-1 3-1l1-2c1 0 3 1 4 3l-2 1c0 4-2 8-6 8s-6-4-6-8l-2-1z" fill="#fff" />
          <circle cx="13" cy="15" r="1" fill="#00B894" />
          <circle cx="19" cy="15" r="1" fill="#00B894" />
        </svg>
      );
    case "walletconnect":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <rect width="32" height="32" rx="8" fill="#3B99FC" />
          <path
            d="M9.5 13c3.6-3.5 9.4-3.5 13 0l.4.4a.6.6 0 010 .9l-1.5 1.4a.3.3 0 01-.4 0l-.6-.5c-2.5-2.4-6.6-2.4-9.1 0l-.6.6a.3.3 0 01-.4 0l-1.5-1.5a.6.6 0 010-.9l.7-.4zm15.9 3l1.3 1.3a.6.6 0 010 .9l-6 5.9a.6.6 0 01-.8 0l-4.3-4.2a.2.2 0 00-.2 0l-4.2 4.2a.6.6 0 01-.9 0l-6-5.9a.6.6 0 010-.9l1.3-1.3a.6.6 0 01.9 0l4.2 4.2a.2.2 0 00.2 0L15 16a.6.6 0 01.9 0l4.3 4.2a.2.2 0 00.2 0l4.2-4.2a.6.6 0 01.9 0z"
            fill="#fff"
          />
        </svg>
      );
    case "ledger":
      return (
        <svg viewBox="0 0 32 32" width={s} height={s} className={className}>
          <rect width="32" height="32" rx="8" fill="#000" />
          <rect x="6" y="9" width="20" height="14" rx="2" fill="none" stroke="#fff" strokeWidth="1.5" />
          <rect x="9" y="12" width="6" height="3" rx="0.5" fill="#fff" />
          <rect x="9" y="17" width="14" height="2" rx="0.5" fill="#fff" opacity="0.6" />
          <rect x="9" y="20" width="9" height="1.5" rx="0.5" fill="#fff" opacity="0.4" />
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
