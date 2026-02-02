'use client';

import { ChainType, normalizeTx } from '@/lib/tx';

interface ExplorerLinksProps {
  tx: string;
  chain: ChainType;
}

// Explorer configurations for each chain
const explorers: Record<ChainType, { name: string; url: string; icon: string }[]> = {
  evm: [
    { name: 'Etherscan', url: 'https://etherscan.io/tx/', icon: '🔍' },
    { name: 'Polygonscan', url: 'https://polygonscan.com/tx/', icon: '🟣' },
    { name: 'Arbiscan', url: 'https://arbiscan.io/tx/', icon: '🔵' },
    { name: 'BscScan', url: 'https://bscscan.com/tx/', icon: '🟡' },
  ],
  solana: [
    { name: 'Solscan', url: 'https://solscan.io/tx/', icon: '◎' },
    { name: 'Solana Explorer', url: 'https://explorer.solana.com/tx/', icon: '🔗' },
    { name: 'SolanaFM', url: 'https://solana.fm/tx/', icon: '📻' },
  ],
  bitcoin: [
    { name: 'Mempool.space', url: 'https://mempool.space/tx/', icon: '🌐' },
    { name: 'Blockstream', url: 'https://blockstream.info/tx/', icon: '⛓️' },
    { name: 'Blockchain.com', url: 'https://www.blockchain.com/btc/tx/', icon: '📊' },
  ],
  unknown: [],
};

/**
 * Displays clickable links to various block explorers for the detected chain.
 * Opens links in new tabs for convenience.
 */
export default function ExplorerLinks({ tx, chain }: ExplorerLinksProps) {
  if (chain === 'unknown') {
    return null;
  }

  const chainExplorers = explorers[chain];
  const normalized = normalizeTx(tx);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        View on Explorer
      </h3>
      <div className="flex flex-wrap gap-2">
        {chainExplorers.map((explorer) => (
          <a
            key={explorer.name}
            href={`${explorer.url}${normalized}`}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              px-4 py-2
              bg-gray-800 hover:bg-gray-700
              border border-gray-700 hover:border-gray-600
              rounded-lg
              text-sm text-gray-200
              transition-all duration-200
              hover:scale-105
            "
          >
            <span>{explorer.icon}</span>
            <span>{explorer.name}</span>
            <svg
              className="w-3 h-3 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
