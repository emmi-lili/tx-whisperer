'use client';

import { detectChain, getChainName, ChainType } from '@/lib/tx';

interface HistoryListProps {
  history: string[];
  onSelect: (tx: string) => void;
  onClear: () => void;
}

// Shortened display of transaction hash
function shortenTx(tx: string): string {
  if (tx.length <= 20) return tx;
  return `${tx.slice(0, 10)}...${tx.slice(-8)}`;
}

// Small badge for chain type in history
function SmallChainBadge({ chain }: { chain: ChainType }) {
  const colors: Record<ChainType, string> = {
    evm: 'bg-blue-500/30 text-blue-400',
    solana: 'bg-purple-500/30 text-purple-400',
    bitcoin: 'bg-orange-500/30 text-orange-400',
    unknown: 'bg-gray-500/30 text-gray-400',
  };

  const shortNames: Record<ChainType, string> = {
    evm: 'EVM',
    solana: 'SOL',
    bitcoin: 'BTC',
    unknown: '???',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[chain]}`}>
      {shortNames[chain]}
    </span>
  );
}

/**
 * Displays a list of previously searched transactions.
 * Allows users to quickly re-select past searches or clear history.
 */
export default function HistoryList({ history, onSelect, onClear }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm">No transaction history yet</p>
        <p className="text-xs text-gray-600 mt-1">
          Your searched transactions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Recent Searches
        </h3>
        <button
          onClick={onClear}
          className="
            text-xs text-gray-500 hover:text-red-400
            transition-colors duration-200
          "
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((tx, index) => {
          const chain = detectChain(tx);
          return (
            <button
              key={`${tx}-${index}`}
              onClick={() => onSelect(tx)}
              className="
                w-full flex items-center justify-between gap-3
                px-3 py-2
                bg-gray-800/50 hover:bg-gray-700/50
                border border-gray-800 hover:border-gray-700
                rounded-lg
                text-left
                transition-all duration-200
                group
              "
            >
              <code className="text-sm text-gray-300 font-mono truncate group-hover:text-white">
                {shortenTx(tx)}
              </code>
              <SmallChainBadge chain={chain} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
