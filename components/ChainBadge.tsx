'use client';

import { ChainType, getChainName } from '@/lib/tx';

interface ChainBadgeProps {
  chain: ChainType;
}

/**
 * Displays a colored badge indicating the detected blockchain.
 * Each chain has a distinct color scheme for easy identification.
 */
export default function ChainBadge({ chain }: ChainBadgeProps) {
  // Color schemes for each chain
  const colorClasses: Record<ChainType, string> = {
    evm: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    solana: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    bitcoin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  // Icons/emojis for each chain (using simple text for no external deps)
  const chainIcons: Record<ChainType, string> = {
    evm: '⟠',
    solana: '◎',
    bitcoin: '₿',
    unknown: '?',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 
        px-3 py-1.5 
        rounded-full 
        text-sm font-medium 
        border 
        ${colorClasses[chain]}
      `}
    >
      <span className="text-base">{chainIcons[chain]}</span>
      <span>{getChainName(chain)}</span>
    </span>
  );
}
