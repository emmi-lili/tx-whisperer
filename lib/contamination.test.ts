/**
 * Unit-like checks for contamination.ts
 * 
 * Run with: npx tsx lib/contamination.test.ts
 */

import { 
  checkContamination, 
  isFlagged, 
  normalizeValue, 
  getBlacklistInfo,
  getBlacklistEntries 
} from './contamination';

// Simple test helpers
let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ ${message}`);
    console.log(`    Expected: ${expected}`);
    console.log(`    Actual:   ${actual}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
  console.log('─'.repeat(name.length));
}

// =============================================================================
// Tests
// =============================================================================

section('getBlacklistInfo()');
const info = getBlacklistInfo();
assertEqual(info.version, '1.0.0', 'Blacklist version is 1.0.0');
assert(info.entryCount > 0, 'Blacklist has entries');
assert(info.lastUpdated.length > 0, 'Blacklist has lastUpdated date');

section('getBlacklistEntries()');
const entries = getBlacklistEntries();
assert(entries.length > 0, 'Returns array of entries');
assert(entries[0].value !== undefined, 'Entries have value field');
assert(entries[0].chain !== undefined, 'Entries have chain field');
assert(entries[0].type !== undefined, 'Entries have type field');
assert(entries[0].label !== undefined, 'Entries have label field');
assert(entries[0].source !== undefined, 'Entries have source field');

section('normalizeValue()');
assertEqual(normalizeValue('  0xABC  '), '0xabc', 'Trims and lowercases EVM');
assertEqual(normalizeValue('  test  '), 'test', 'Trims whitespace');
// Note: Short strings like 'ABC123' are not lowercased since they're not valid tx hashes

section('checkContamination() - Flagged entries');
// Test with a known blacklisted address (from our demo data)
const tornadoCashResult = checkContamination('0x8589427373D6D84E98730D7795D8f6f8731FDA16');
assertEqual(tornadoCashResult.status, 'flagged', 'Tornado Cash address is flagged');
assert(tornadoCashResult.matches.length > 0, 'Has match details');
assert(tornadoCashResult.matches[0].entry.label.includes('Tornado'), 'Match has correct label');

// Test case insensitivity for EVM
const tornadoLowercase = checkContamination('0x8589427373d6d84e98730d7795d8f6f8731fda16');
assertEqual(tornadoLowercase.status, 'flagged', 'Case insensitive matching for EVM');

section('checkContamination() - Clean entries');
// Test with a clean address (Vitalik's address, not in blacklist)
const cleanResult = checkContamination('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
assertEqual(cleanResult.status, 'clean', 'Clean address returns clean status');
assertEqual(cleanResult.matches.length, 0, 'Clean address has no matches');

section('checkContamination() - Unknown inputs');
const unknownResult = checkContamination('invalid-input');
assertEqual(unknownResult.status, 'unknown', 'Invalid input returns unknown status');

const emptyResult = checkContamination('');
assertEqual(emptyResult.status, 'unknown', 'Empty input returns unknown status');

section('isFlagged()');
assert(isFlagged('0x8589427373d6d84e98730d7795d8f6f8731fda16'), 'isFlagged returns true for blacklisted');
assert(!isFlagged('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'), 'isFlagged returns false for clean');

section('checkContamination() - Bitcoin');
// Test with the demo Bitcoin address in blacklist
const btcResult = checkContamination('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
assertEqual(btcResult.status, 'flagged', 'Demo Bitcoin address is flagged');

section('checkContamination() - Transaction hashes');
// Test with flagged tx hash from demo data
const txResult = checkContamination('0x2d05f14d405d3a22c9e8d1c3e67ed8f9c17e75e5b4c4b3f2f1a7b8c9d0e1f234');
assertEqual(txResult.status, 'flagged', 'Demo flagged tx hash is detected');

// =============================================================================
// Summary
// =============================================================================

console.log('\n' + '═'.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(40));

if (failed > 0) {
  process.exit(1);
}
