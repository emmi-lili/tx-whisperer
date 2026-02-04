/**
 * Contamination checking logic for Tx Whisperer
 * 
 * Checks addresses and transaction hashes against a local blacklist.
 * This is a DEMO implementation - not for real compliance use.
 */

import { normalizeTx, detectInputType, detectChain } from './tx';
import type { 
  BlacklistEntry, 
  BlacklistData, 
  ContaminationResult, 
  ContaminationMatch,
  ContaminationStatus 
} from './types';

// Import blacklist data
import blacklistData from '@/data/blacklist.json';

/**
 * Normalize a value for comparison
 * - Removes whitespace
 * - Lowercases hex values (EVM, Bitcoin tx)
 * - Preserves case for base58 (Solana)
 */
export function normalizeValue(input: string): string {
  return normalizeTx(input);
}

/**
 * Check if two values match (case-insensitive for hex, case-sensitive for base58)
 */
function valuesMatch(input: string, blacklistValue: string): boolean {
  const normalizedInput = normalizeValue(input);
  const normalizedBlacklist = normalizeValue(blacklistValue);
  
  // For hex values, compare lowercase
  if (normalizedInput.startsWith('0x') || /^[a-fA-F0-9]{64}$/.test(normalizedInput)) {
    return normalizedInput.toLowerCase() === normalizedBlacklist.toLowerCase();
  }
  
  // For base58 (Solana), exact match
  return normalizedInput === normalizedBlacklist;
}

/**
 * Get the blacklist entries
 * This function allows for future expansion (e.g., loading from API)
 */
export function getBlacklistEntries(): BlacklistEntry[] {
  const data = blacklistData as BlacklistData;
  return data.entries;
}

/**
 * Check an input against the blacklist
 * 
 * @param input - Address or transaction hash to check
 * @returns ContaminationResult with status and any matches
 */
export function checkContamination(input: string): ContaminationResult {
  const normalized = normalizeValue(input);
  const inputType = detectInputType(normalized);
  const chain = detectChain(normalized);
  
  // If we can't identify the input, return unknown
  if (inputType === 'unknown' || chain === 'unknown') {
    return {
      status: 'unknown',
      matches: [],
      checkedAt: new Date().toISOString(),
    };
  }
  
  const entries = getBlacklistEntries();
  const matches: ContaminationMatch[] = [];
  
  // Check against each blacklist entry
  for (const entry of entries) {
    // Only compare entries of the same type (address vs tx) and chain
    if (entry.type === inputType && entry.chain === chain) {
      if (valuesMatch(normalized, entry.value)) {
        matches.push({
          input: normalized,
          entry,
        });
      }
    }
    
    // Also check if the normalized values match regardless of type/chain
    // (in case of misclassification)
    if (valuesMatch(normalized, entry.value) && !matches.some(m => m.entry === entry)) {
      matches.push({
        input: normalized,
        entry,
      });
    }
  }
  
  const status: ContaminationStatus = matches.length > 0 ? 'flagged' : 'clean';
  
  return {
    status,
    matches,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Quick check if an input is flagged (boolean result)
 */
export function isFlagged(input: string): boolean {
  const result = checkContamination(input);
  return result.status === 'flagged';
}

/**
 * Get blacklist metadata
 */
export function getBlacklistInfo(): { version: string; lastUpdated: string; entryCount: number } {
  const data = blacklistData as BlacklistData;
  return {
    version: data.version,
    lastUpdated: data.lastUpdated,
    entryCount: data.entries.length,
  };
}
