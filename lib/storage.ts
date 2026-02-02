/**
 * Local storage utilities for transaction history
 * 
 * Stores and retrieves transaction hashes from browser localStorage.
 * Includes safety checks for server-side rendering.
 */

const HISTORY_KEY = 'tx-whisperer-history';
const MAX_HISTORY_ITEMS = 50; // Limit history to prevent localStorage bloat

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get transaction history from localStorage
 * @returns Array of transaction hashes, newest first
 */
export function getHistory(): string[] {
  if (!isBrowser()) {
    return [];
  }
  
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    
    // Validate that it's an array of strings
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
    
    return [];
  } catch (error) {
    console.error('Error reading history from localStorage:', error);
    return [];
  }
}

/**
 * Add a transaction hash to history
 * Prevents duplicates and maintains max history limit
 * 
 * @param tx - Transaction hash to add
 */
export function addToHistory(tx: string): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const normalized = tx.trim();
    if (!normalized) {
      return;
    }
    
    const history = getHistory();
    
    // Remove if already exists (to move to top)
    const filtered = history.filter(item => item !== normalized);
    
    // Add to beginning (newest first)
    const updated = [normalized, ...filtered];
    
    // Limit to max items
    const limited = updated.slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
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
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Remove a single transaction from history
 * 
 * @param tx - Transaction hash to remove
 */
export function removeFromHistory(tx: string): void {
  if (!isBrowser()) {
    return;
  }
  
  try {
    const history = getHistory();
    const filtered = history.filter(item => item !== tx);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}
