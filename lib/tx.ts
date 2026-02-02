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

/**
 * Check if a string contains only valid hex characters
 */
function isHexString(str: string): boolean {
  return str.split('').every(char => HEX_CHARS.includes(char));
}

/**
 * Check if a string contains only valid base58 characters
 */
function isBase58String(str: string): boolean {
  return str.split('').every(char => BASE58_CHARS.includes(char));
}

/**
 * Normalize a transaction hash by trimming whitespace
 * and converting to lowercase for hex-based chains.
 */
export function normalizeTx(tx: string): string {
  const trimmed = tx.trim();
  
  // If it looks like hex (EVM or Bitcoin), convert to lowercase
  // Keep Solana signatures as-is since base58 is case-sensitive
  if (trimmed.startsWith('0x') || (trimmed.length === 64 && isHexString(trimmed))) {
    return trimmed.toLowerCase();
  }
  
  return trimmed;
}

/**
 * Detect which blockchain a transaction hash belongs to.
 * 
 * Heuristics:
 * - EVM: Starts with "0x" followed by exactly 64 hex characters (total 66 chars)
 * - Bitcoin: Exactly 64 hex characters without "0x" prefix
 * - Solana: Base58 encoded, typically 80-90 characters long
 * 
 * @param tx - The transaction hash to analyze
 * @returns The detected chain type
 */
export function detectChain(tx: string): ChainType {
  const normalized = normalizeTx(tx);
  
  // Empty or too short
  if (!normalized || normalized.length < 10) {
    return 'unknown';
  }
  
  // EVM: 0x + 64 hex characters = 66 total characters
  if (normalized.startsWith('0x')) {
    const hashPart = normalized.slice(2);
    if (hashPart.length === 64 && isHexString(hashPart)) {
      return 'evm';
    }
    return 'unknown';
  }
  
  // Bitcoin: 64 hex characters without 0x prefix
  if (normalized.length === 64 && isHexString(normalized)) {
    return 'bitcoin';
  }
  
  // Solana: Base58 encoded, typically 80-90 characters
  // Solana signatures are usually 87-88 characters
  if (normalized.length >= 80 && normalized.length <= 90 && isBase58String(normalized)) {
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
