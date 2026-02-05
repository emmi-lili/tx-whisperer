/**
 * Local storage utilities for transaction history
 * 
 * Stores and retrieves transaction hashes from browser localStorage.
 * Includes safety checks for server-side rendering.
 * 
 * Storage format v2: Stores objects with value and contamination status
 * Backwards compatible with v1 (plain string arrays)
 */

import type { ContaminationStatus } from './types';

const HISTORY_KEY = 'tx-whisperer-history';
const HISTORY_VERSION_KEY = 'tx-whisperer-history-version';
const CURRENT_VERSION = 2;
const MAX_HISTORY_ITEMS = 50;

/**
 * History item with contamination status
 */
export interface HistoryItem {
  /** The input value (address or tx hash) */
  value: string;
  /** Last known contamination status */
  contaminationStatus: ContaminationStatus | null;
  /** Timestamp when added */
  addedAt: string;
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Migrate v1 history (string[]) to v2 (HistoryItem[])
 */
function migrateV1ToV2(v1Data: string[]): HistoryItem[] {
  return v1Data.map(value => ({
    value,
    contaminationStatus: null,
    addedAt: new Date().toISOString(),
  }));
}

/**
 * Get the current storage version
 */
function getStorageVersion(): number {
  if (!isBrowser()) return CURRENT_VERSION;
  
  try {
    const version = localStorage.getItem(HISTORY_VERSION_KEY);
    return version ? parseInt(version, 10) : 1;
  } catch {
    return 1;
  }
}

/**
 * Set the storage version
 */
function setStorageVersion(version: number): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(HISTORY_VERSION_KEY, version.toString());
  } catch (error) {
    console.error('Error setting storage version:', error);
  }
}

/**
 * Get history items from localStorage
 * Handles migration from v1 format automatically
 * 
 * @returns Array of history items, newest first
 */
export function getHistoryItems(): HistoryItem[] {
  if (!isBrowser()) {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    const version = getStorageVersion();
    
    // Handle v1 format (array of strings)
    if (version === 1 && Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      const migrated = migrateV1ToV2(parsed);
      // Save migrated data
      localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
      setStorageVersion(CURRENT_VERSION);
      return migrated;
    }
    
    // Handle v2 format (array of HistoryItem)
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item.value)) {
      return parsed as HistoryItem[];
    }
    
    return [];
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
}

/**
 * Get transaction history from localStorage (legacy, returns just values)
 * @returns Array of transaction hashes, newest first
 */
export function getHistory(): string[] {
  return getHistoryItems().map(item => item.value);
}

/**
 * Add a transaction/address to history with optional contamination status
 * Prevents duplicates and maintains max history limit
 * 
 * @param value - Transaction hash or address to add
 * @param contaminationStatus - Optional contamination status
 */
export function addToHistory(value: string, contaminationStatus?: ContaminationStatus): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const normalized = value.trim();
    if (!normalized) {
      return;
    }
    
    const history = getHistoryItems();
    
    // Remove if already exists (to move to top)
    const filtered = history.filter(item => item.value !== normalized);
    
    // Create new item
    const newItem: HistoryItem = {
      value: normalized,
      contaminationStatus: contaminationStatus ?? null,
      addedAt: new Date().toISOString(),
    };
    
    // Add to beginning (newest first)
    const updated = [newItem, ...filtered];
    
    // Limit to max items
    const limited = updated.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
    setStorageVersion(CURRENT_VERSION);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Update contamination status for an existing history item
 * 
 * @param value - The value to update
 * @param contaminationStatus - New contamination status
 */
export function updateContaminationStatus(value: string, contaminationStatus: ContaminationStatus): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const history = getHistoryItems();
    const updated = history.map(item => 
      item.value === value 
        ? { ...item, contaminationStatus }
        : item
    );
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating contamination status:', error);
  }
}

/**
 * Get contamination status for a specific value
 * 
 * @param value - The value to look up
 * @returns The contamination status or null if not found
 */
export function getContaminationStatus(value: string): ContaminationStatus | null {
  const history = getHistoryItems();
  const item = history.find(h => h.value === value);
  return item?.contaminationStatus ?? null;
}

/**
 * Clear all transaction history
 */
export function clearHistory(): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(HISTORY_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Remove a single transaction from history
 * 
 * @param value - Transaction hash or address to remove
 */
export function removeFromHistory(value: string): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const history = getHistoryItems();
    const filtered = history.filter(item => item.value !== value);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}
