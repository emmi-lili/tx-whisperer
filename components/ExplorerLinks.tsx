'use client';

import { ChainType, normalizeTx } from '@/lib/tx';
import { useToast } from './Toast';

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

// Copy icon component
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

// External link icon component
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

/**
 * Displays clickable links to various block explorers for the detected chain.
 * Includes copy-to-clipboard functionality for each explorer URL.
 */
export default function ExplorerLinks({ tx, chain }: ExplorerLinksProps) {
  const { showToast } = useToast();

  if (chain === 'unknown') {
    return null;
  }

  const chainExplorers = explorers[chain];
  const normalized = normalizeTx(tx);

  // Copy URL to clipboard
  const handleCopy = async (explorerName: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(`${explorerName} link copied!`, 'success');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.setAttribute('aria-hidden', 'true');
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast(`${explorerName} link copied!`, 'success');
      } catch {
        showToast('Failed to copy link', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
        View on Explorer
      </h3>
      <div className="flex flex-wrap gap-2">
        {chainExplorers.map((explorer) => {
          const fullUrl = `${explorer.url}${normalized}`;
          
          return (
            <div 
              key={explorer.name} 
              className="inline-flex items-stretch rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
              role="group"
              aria-label={`${explorer.name} explorer link and copy button`}
            >
              {/* Link to explorer */}
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center gap-2
                  px-3 py-2
                  bg-gray-800 hover:bg-gray-700
                  text-sm text-gray-200
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                "
                aria-label={`Open transaction on ${explorer.name} (opens in new tab)`}
              >
                <span aria-hidden="true">{explorer.icon}</span>
                <span>{explorer.name}</span>
                <ExternalLinkIcon className="w-3 h-3 text-gray-500" />
              </a>
              
              {/* Copy button */}
              <button
                onClick={() => handleCopy(explorer.name, fullUrl)}
                className="
                  px-2.5
                  bg-gray-800/50 hover:bg-gray-700
                  border-l border-gray-700
                  text-gray-400 hover:text-gray-200
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                "
                aria-label={`Copy ${explorer.name} link to clipboard`}
                title={`Copy ${explorer.name} link`}
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
