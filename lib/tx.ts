/**
 * Transaction utility functions for Tx Whisperer
 * 
 * This module provides heuristics-based chain detection for transaction hashes.
 * No RPC calls are made - detection is purely based on format analysis.
 */

// Supported chain types
export type ChainType = 'evm' | 'solana' | 'bitcoin' | 'unknown';

// Base58 character set used by Solana (excludes 0, O, I, l)
const BASE58_CHARS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Hex character set
const HEX_CHARS = '0123456789abcdefABCDEF';

// Common blockchain explorer URL patterns
const EXPLORER_PATTERNS: { pattern: RegExp; extractor: (match: RegExpMatchArray) => string }[] = [
  // Etherscan and EVM explorers: /tx/0x...
  { pattern: /\/tx\/(0x[a-fA-F0-9]{64})\/?/, extractor: (m) => m[1] },
  // Solscan: /tx/...
  { pattern: /solscan\.io\/tx\/([1-9A-HJ-NP-Za-km-z]{80,90})\/?/, extractor: (m) => m[1] },
  // Solana Explorer: /tx/...
  { pattern: /explorer\.solana\.com\/tx\/([1-9A-HJ-NP-Za-km-z]{80,90})/, extractor: (m) => m[1] },
  // Mempool.space Bitcoin: /tx/...
  { pattern: /mempool\.space\/tx\/([a-fA-F0-9]{64})\/?/, extractor: (m) => m[1] },
  // Blockchain.com Bitcoin: /btc/tx/...
  { pattern: /blockchain\.com\/(?:btc\/)?tx\/([a-fA-F0-9]{64})\/?/, extractor: (m) => m[1] },
  // Blockchair Bitcoin: /bitcoin/transaction/...
  { pattern: /blockchair\.com\/bitcoin\/transaction\/([a-fA-F0-9]{64})\/?/, extractor: (m) => m[1] },
  // Generic: extract 0x-prefixed 66-char hash
  { pattern: /(0x[a-fA-F0-9]{64})/, extractor: (m) => m[1] },
  // Generic: extract 64-char hex (Bitcoin-style)
  { pattern: /\/([a-fA-F0-9]{64})\/?$/, extractor: (m) => m[1] },
];

/**
 * Check if a string contains only valid hex characters
 */
function isHexString(str: string): boolean {
  if (str.length === 0) return false;
  for (let i = 0; i < str.length; i++) {
    if (!HEX_CHARS.includes(str[i])) return false;
  }
  return true;
}

/**
 * Check if a string contains only valid base58 characters
 */
function isBase58String(str: string): boolean {
  if (str.length === 0) return false;
  for (let i = 0; i < str.length; i++) {
    if (!BASE58_CHARS.includes(str[i])) return false;
  }
  return true;
}

/**
 * Check if a hex string is trivially invalid (all zeros or all f's)
 */
function isTrivialHex(hex: string): boolean {
  const lower = hex.toLowerCase();
  return /^0+$/.test(lower) || /^f+$/.test(lower);
}

/**
 * Try to extract a transaction hash from a URL
 */
export function extractFromUrl(input: string): string | null {
  for (const { pattern, extractor } of EXPLORER_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      return extractor(match);
    }
  }
  return null;
}

/**
 * Normalize a transaction hash by:
 * - Extracting from URL if needed
 * - Trimming whitespace and newlines
 * - Converting hex to lowercase
 * - Normalizing 0X to 0x
 */
export function normalizeTx(tx: string): string {
  // Remove all whitespace including newlines
  let cleaned = tx.replace(/\s+/g, '');
  
  // Try to extract from URL if it looks like a URL
  if (cleaned.includes('://') || cleaned.includes('.io/') || cleaned.includes('.com/')) {
    const extracted = extractFromUrl(cleaned);
    if (extracted) {
      cleaned = extracted;
    }
  }
  
  // Normalize uppercase 0X prefix to lowercase 0x
  if (cleaned.startsWith('0X')) {
    cleaned = '0x' + cleaned.slice(2);
  }
  
  // If it looks like hex (EVM or Bitcoin), convert to lowercase
  // Keep Solana signatures as-is since base58 is case-sensitive
  if (cleaned.startsWith('0x') || (cleaned.length === 64 && isHexString(cleaned))) {
    return cleaned.toLowerCase();
  }
  
  return cleaned;
}

/**
 * Detect which blockchain a transaction hash belongs to.
 * 
 * Heuristics:
 * - EVM: Starts with "0x" followed by exactly 64 hex characters (total 66 chars)
 * - Bitcoin: Exactly 64 hex characters without "0x" prefix
 * - Solana: Base58 encoded, typically 86-90 characters long
 * 
 * @param tx - The transaction hash to analyze
 * @returns The detected chain type
 */
export function detectChain(tx: string): ChainType {
  const normalized = normalizeTx(tx);
  
  // Empty or too short to be any valid hash
  if (!normalized || normalized.length < 32) {
    return 'unknown';
  }
  
  // EVM: 0x + 64 hex characters = 66 total characters
  if (normalized.startsWith('0x')) {
    const hashPart = normalized.slice(2);
    if (hashPart.length === 64 && isHexString(hashPart) && !isTrivialHex(hashPart)) {
      return 'evm';
    }
    return 'unknown';
  }
  
  // Check for Solana first if it's clearly base58 (contains chars not in hex)
  // Solana signatures are 86-88 characters typically, but can be up to 90
  if (normalized.length >= 86 && normalized.length <= 90) {
    if (isBase58String(normalized)) {
      // Additional check: Solana signatures usually contain mixed case
      // and chars not found in hex (like G, H, J, K, etc.)
      const hasNonHexChars = /[GHJKLMNPQRSTUVWXYZghjkmnpqrstuvwxyz]/.test(normalized);
      if (hasNonHexChars) {
        return 'solana';
      }
    }
  }
  
  // Bitcoin: 64 hex characters without 0x prefix
  if (normalized.length === 64 && isHexString(normalized) && !isTrivialHex(normalized)) {
    return 'bitcoin';
  }
  
  // Fallback: check for base58 in wider range (some Solana sigs can be 85-90)
  if (normalized.length >= 85 && normalized.length <= 90 && isBase58String(normalized)) {
    return 'solana';
  }
  
  return 'unknown';
}

/**
 * Check if a transaction hash is valid for any supported chain.
 * A valid transaction must be detected as one of the known chain types.
 */
export function isValidTx(tx: string): boolean {
  return detectChain(tx) !== 'unknown';
}

/**
 * Get human-readable chain name
 */
export function getChainName(chain: ChainType): string {
  const names: Record<ChainType, string> = {
    evm: 'Ethereum / EVM',
    solana: 'Solana',
    bitcoin: 'Bitcoin',
    unknown: 'Unknown',
  };
  return names[chain];
}

/**
 * Get explorer URL for a transaction based on detected chain
 */
export function getExplorerUrl(tx: string, chain: ChainType): string | null {
  const normalized = normalizeTx(tx);
  
  switch (chain) {
    case 'evm':
      return `https://etherscan.io/tx/${normalized}`;
    case 'solana':
      return `https://solscan.io/tx/${normalized}`;
    case 'bitcoin':
      return `https://mempool.space/tx/${normalized}`;
    default:
      return null;
  }
}
