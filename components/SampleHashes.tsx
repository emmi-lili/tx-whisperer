'use client';

import { detectChain, getChainName, ChainType } from '@/lib/tx';

// 6 sample hashes - 2 from each chain
const SAMPLE_HASHES = [
  // EVM
  '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060',
  '0x2d05f14d405d3a22c9e8d1c3e67ed8f9c17e75e5b4c4b3f2f1a7b8c9d0e1f234',
  // Bitcoin
  'e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468',
  '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  // Solana
  '5UfDuX7WXY4X3X4Gi94YcXdU8GjRqNn7dvK6Krw39e2qFjYBrtPgNE7C3UcC1oVPpJRqHqKYnNhb9dJmjMgfb1XA',
  '4Ee8qqcYkBkjLNWJzK3u4YN4b5yVcKq9ZBjXJvPeZgKBcKc5NJNj4FhEmXMrQJPqLQSHvVVS9mEGqT3wkBx5M9Fn',
];

const CHAIN_COLORS: Record<ChainType, { bg: string; text: string; border: string }> = {
  evm: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  bitcoin: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  solana: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  unknown: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
};

interface SampleHashesProps {
  onSelect: (tx: string) => void;
}

export default function SampleHashes({ onSelect }: SampleHashesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          Sample Hashes
        </h3>
        <span className="text-xs text-gray-500">Click to try</span>
      </div>
      
      <div className="grid gap-2">
        {SAMPLE_HASHES.map((hash, index) => {
          const chain = detectChain(hash);
          const colors = CHAIN_COLORS[chain];
          const truncated = hash.length > 24 
            ? `${hash.slice(0, 12)}...${hash.slice(-8)}`
            : hash;
          
          return (
            <button
              key={index}
              onClick={() => onSelect(hash)}
              className={`
                group flex items-center justify-between gap-3 p-3 rounded-lg
                ${colors.bg} border ${colors.border}
                hover:border-opacity-60 transition-all duration-200
                text-left
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`
                  text-xs font-medium px-2 py-0.5 rounded
                  ${colors.bg} ${colors.text} border ${colors.border}
                `}>
                  {getChainName(chain).split(' ')[0]}
                </span>
                <code className="text-sm text-gray-300 font-mono truncate">
                  {truncated}
                </code>
              </div>
              
              <svg 
                className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Detection results: 2 EVM, 2 Bitcoin, 2 Solana
      </p>
    </div>
  );
}
