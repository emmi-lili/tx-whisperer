/**
 * Shared type definitions for Tx Whisperer
 */

import { ChainType, InputType } from './tx';

/**
 * A single entry in the blacklist
 */
export interface BlacklistEntry {
  /** The address or transaction hash */
  value: string;
  /** Which blockchain this belongs to */
  chain: ChainType;
  /** Whether this is an address or transaction */
  type: InputType;
  /** Human-readable label describing why it's flagged */
  label: string;
  /** Source of the flag (e.g., "OFAC", "Community Reports") */
  source: string;
}

/**
 * The full blacklist data structure
 */
export interface BlacklistData {
  version: string;
  description: string;
  disclaimer: string;
  lastUpdated: string;
  entries: BlacklistEntry[];
}

/**
 * Result of a contamination check
 */
export type ContaminationStatus = 'clean' | 'flagged' | 'unknown';

/**
 * A match found during contamination check
 */
export interface ContaminationMatch {
  /** The original input that was checked */
  input: string;
  /** The blacklist entry that matched */
  entry: BlacklistEntry;
}

/**
 * Full result of a contamination check
 */
export interface ContaminationResult {
  /** Overall status */
  status: ContaminationStatus;
  /** List of matches (empty if clean) */
  matches: ContaminationMatch[];
  /** Timestamp of the check */
  checkedAt: string;
}
