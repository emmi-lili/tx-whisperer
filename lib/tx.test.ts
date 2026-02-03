/**
 * Unit-like checks for tx.ts
 * 
 * Run with: npx tsx lib/tx.test.ts
 * No test runner required.
 */

import { 
  detectChain, 
  normalizeTx, 
  extractFromUrl, 
  isValidTx, 
  detectInputType,
  isEvmAddress,
  isSolanaAddress,
  isBitcoinAddress,
  detectChainFromAddress,
  ChainType,
  InputType 
} from './tx';

// Simple assertion helper
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
  const isEqual = actual === expected;
  if (isEqual) {
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
// Test Data - Real transaction hashes from each chain
// =============================================================================

export const SAMPLE_HASHES = {
  evm: [
    // Ethereum mainnet transactions
    '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', // First ever ETH transfer
    '0x2d05f14d405d3a22c9e8d1c3e67ed8f9c17e75e5b4c4b3f2f1a7b8c9d0e1f234', // Example format
  ],
  bitcoin: [
    // Bitcoin mainnet transactions
    'e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468', // A real BTC tx
    '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', // Genesis block coinbase
  ],
  solana: [
    // Solana mainnet signatures
    '5UfDuX7WXY4X3X4Gi94YcXdU8GjRqNn7dvK6Krw39e2qFjYBrtPgNE7C3UcC1oVPpJRqHqKYnNhb9dJmjMgfb1XA',
    '4Ee8qqcYkBkjLNWJzK3u4YN4b5yVcKq9ZBjXJvPeZgKBcKc5NJNj4FhEmXMrQJPqLQSHvVVS9mEGqT3wkBx5M9Fn',
  ],
  invalid: [
    'not-a-valid-hash',
    '0x123', // Too short
    '0000000000000000000000000000000000000000000000000000000000000000', // All zeros
    '', // Empty
    '   ', // Whitespace only
  ],
};

// Sample addresses for testing
export const SAMPLE_ADDRESSES = {
  evm: [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik's address
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC contract
  ],
  bitcoin: [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block address (Satoshi)
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // P2SH address
    'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', // Bech32 address
  ],
  solana: [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC on Solana
    'So11111111111111111111111111111111111111112', // Wrapped SOL
  ],
};

// =============================================================================
// Tests
// =============================================================================

section('detectChain() - EVM transactions');
assertEqual(detectChain(SAMPLE_HASHES.evm[0]), 'evm', 'Detects standard EVM tx hash');
assertEqual(detectChain(SAMPLE_HASHES.evm[1]), 'evm', 'Detects EVM hash with 0x prefix');
assertEqual(detectChain('0x' + 'a'.repeat(64)), 'evm', 'Detects 0x + 64 hex chars as EVM');
assertEqual(detectChain('0X' + 'A'.repeat(64)), 'evm', 'Handles uppercase 0X prefix');

section('detectChain() - Bitcoin transactions');
assertEqual(detectChain(SAMPLE_HASHES.bitcoin[0]), 'bitcoin', 'Detects standard Bitcoin tx hash');
assertEqual(detectChain(SAMPLE_HASHES.bitcoin[1]), 'bitcoin', 'Detects genesis coinbase tx');
assertEqual(detectChain('a'.repeat(64)), 'bitcoin', 'Detects 64 hex chars as Bitcoin');

section('detectChain() - Solana signatures');
assertEqual(detectChain(SAMPLE_HASHES.solana[0]), 'solana', 'Detects standard Solana signature');
assertEqual(detectChain(SAMPLE_HASHES.solana[1]), 'solana', 'Detects another Solana signature');

section('detectChain() - Invalid inputs');
assertEqual(detectChain('not-a-valid-hash'), 'unknown', 'Rejects invalid string');
assertEqual(detectChain('0x123'), 'unknown', 'Rejects too-short EVM hash');
assertEqual(detectChain(''), 'unknown', 'Rejects empty string');
assertEqual(detectChain('   '), 'unknown', 'Rejects whitespace-only');
assertEqual(detectChain('0'.repeat(64)), 'unknown', 'Rejects all-zeros Bitcoin hash');
assertEqual(detectChain('0x' + '0'.repeat(64)), 'unknown', 'Rejects all-zeros EVM hash');
assertEqual(detectChain('0x' + 'f'.repeat(64)), 'unknown', 'Rejects all-f EVM hash');

section('normalizeTx() - Whitespace handling');
assertEqual(normalizeTx('  0x123abc  '), '0x123abc', 'Trims leading/trailing spaces');
assertEqual(normalizeTx('0x123\n456'), '0x123456', 'Removes newlines');
assertEqual(normalizeTx('  \n  0xabc  \n  '), '0xabc', 'Handles mixed whitespace');

section('normalizeTx() - Case normalization');
assertEqual(normalizeTx('0xABCDEF'), '0xabcdef', 'Lowercases EVM hashes');
assertEqual(normalizeTx('ABCDEF1234' + '0'.repeat(54)), 'abcdef1234' + '0'.repeat(54), 'Lowercases Bitcoin-length hex');

section('extractFromUrl() - Explorer URLs');
const evmHash = '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060';
const btcHash = 'e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468';

assertEqual(
  extractFromUrl(`https://etherscan.io/tx/${evmHash}`),
  evmHash,
  'Extracts from Etherscan URL'
);
assertEqual(
  extractFromUrl(`https://polygonscan.com/tx/${evmHash}`),
  evmHash,
  'Extracts from Polygonscan URL'
);
assertEqual(
  extractFromUrl(`https://mempool.space/tx/${btcHash}`),
  btcHash,
  'Extracts from Mempool.space URL'
);

section('detectChain() - URL input handling');
assertEqual(
  detectChain(`https://etherscan.io/tx/${evmHash}`),
  'evm',
  'Detects chain from Etherscan URL'
);
assertEqual(
  detectChain(`https://mempool.space/tx/${btcHash}`),
  'bitcoin',
  'Detects chain from Mempool URL'
);

section('isValidTx()');
assert(isValidTx(SAMPLE_HASHES.evm[0]), 'Valid EVM hash returns true');
assert(isValidTx(SAMPLE_HASHES.bitcoin[0]), 'Valid Bitcoin hash returns true');
assert(isValidTx(SAMPLE_HASHES.solana[0]), 'Valid Solana hash returns true');
assert(!isValidTx('invalid'), 'Invalid hash returns false');
assert(!isValidTx(''), 'Empty string returns false');

// =============================================================================
// Address Detection Tests
// =============================================================================

section('isEvmAddress()');
assert(isEvmAddress(SAMPLE_ADDRESSES.evm[0]), 'Detects Vitalik address as EVM');
assert(isEvmAddress(SAMPLE_ADDRESSES.evm[1]), 'Detects USDC contract as EVM');
assert(isEvmAddress('0x' + 'a'.repeat(40)), 'Accepts 0x + 40 hex chars');
assert(!isEvmAddress('0x' + 'a'.repeat(64)), 'Rejects 0x + 64 hex (tx hash, not address)');
assert(!isEvmAddress('0x' + '0'.repeat(40)), 'Rejects all-zeros address');

section('isBitcoinAddress()');
assert(isBitcoinAddress(SAMPLE_ADDRESSES.bitcoin[0]), 'Detects legacy P2PKH address (starts with 1)');
assert(isBitcoinAddress(SAMPLE_ADDRESSES.bitcoin[1]), 'Detects P2SH address (starts with 3)');
assert(isBitcoinAddress(SAMPLE_ADDRESSES.bitcoin[2]), 'Detects Bech32 address (starts with bc1)');
assert(!isBitcoinAddress('1'), 'Rejects too-short address');
assert(!isBitcoinAddress('2' + 'a'.repeat(30)), 'Rejects invalid prefix');

section('isSolanaAddress()');
assert(isSolanaAddress(SAMPLE_ADDRESSES.solana[0]), 'Detects USDC Solana address');
assert(isSolanaAddress(SAMPLE_ADDRESSES.solana[1]), 'Detects Wrapped SOL address');
assert(!isSolanaAddress('abc'), 'Rejects too-short string');

section('detectChainFromAddress()');
assertEqual(detectChainFromAddress(SAMPLE_ADDRESSES.evm[0]), 'evm', 'Detects EVM address chain');
assertEqual(detectChainFromAddress(SAMPLE_ADDRESSES.bitcoin[0]), 'bitcoin', 'Detects Bitcoin legacy address chain');
assertEqual(detectChainFromAddress(SAMPLE_ADDRESSES.bitcoin[2]), 'bitcoin', 'Detects Bitcoin Bech32 address chain');
assertEqual(detectChainFromAddress(SAMPLE_ADDRESSES.solana[0]), 'solana', 'Detects Solana address chain');
assertEqual(detectChainFromAddress('invalid'), 'unknown', 'Returns unknown for invalid address');

section('detectInputType()');
assertEqual(detectInputType(SAMPLE_HASHES.evm[0]), 'tx', 'Detects EVM tx hash as tx type');
assertEqual(detectInputType(SAMPLE_HASHES.bitcoin[0]), 'tx', 'Detects Bitcoin tx hash as tx type');
assertEqual(detectInputType(SAMPLE_HASHES.solana[0]), 'tx', 'Detects Solana signature as tx type');
assertEqual(detectInputType(SAMPLE_ADDRESSES.evm[0]), 'address', 'Detects EVM address as address type');
assertEqual(detectInputType(SAMPLE_ADDRESSES.bitcoin[0]), 'address', 'Detects Bitcoin address as address type');
assertEqual(detectInputType(SAMPLE_ADDRESSES.solana[0]), 'address', 'Detects Solana address as address type');
assertEqual(detectInputType('invalid'), 'unknown', 'Returns unknown for invalid input');

section('detectChain() - Addresses');
assertEqual(detectChain(SAMPLE_ADDRESSES.evm[0]), 'evm', 'detectChain works with EVM address');
assertEqual(detectChain(SAMPLE_ADDRESSES.bitcoin[0]), 'bitcoin', 'detectChain works with Bitcoin address');
assertEqual(detectChain(SAMPLE_ADDRESSES.solana[0]), 'solana', 'detectChain works with Solana address');

// =============================================================================
// Summary
// =============================================================================

console.log('\n' + '═'.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(40));

if (failed > 0) {
  process.exit(1);
}
