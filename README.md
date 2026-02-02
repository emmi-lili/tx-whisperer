# Tx Whisperer

**Instantly detect which blockchain a transaction hash belongs to — no RPC calls, no API keys, no waiting.**

## The Problem

Working across multiple blockchains means constantly dealing with transaction hashes in different formats. You find a hash in a chat, a spreadsheet, or a log file, and you need to figure out: *Is this Ethereum? Bitcoin? Solana?*

The usual workflow:
1. Guess which chain it might be
2. Open an explorer
3. Paste the hash
4. Get a "not found" error
5. Try another explorer
6. Repeat until you find it (or give up)

**Tx Whisperer solves this in one step.** Paste any transaction hash (or even an explorer URL), and instantly know which blockchain it belongs to.

## Screenshots

<!-- Add screenshots of the application here -->

| Main Interface | Detection Result |
|----------------|------------------|
| ![Main interface](screenshots/main.png) | ![Detection result](screenshots/result.png) |

> **Note:** Replace the placeholder images above with actual screenshots. Create a `screenshots/` folder and add `main.png` and `result.png`.

## Features

- **Instant Detection** — Identifies EVM (Ethereum, Polygon, Arbitrum, BSC), Bitcoin, and Solana transactions
- **URL Support** — Paste explorer URLs directly; the hash is automatically extracted
- **Multiple Explorers** — Quick links to popular block explorers for each chain
- **Copy to Clipboard** — One-click copy for any explorer link with toast notifications
- **Local History** — Your recent transactions are saved locally (localStorage) for quick access
- **Sample Hashes** — Built-in examples to test detection for each chain type
- **Zero Network Requests** — All detection happens client-side using format heuristics
- **Accessible UI** — Keyboard navigable with screen reader support

## How It Works

Tx Whisperer uses **format heuristics** to identify blockchains. No RPC calls are made — detection is purely based on analyzing the structure of the hash.

### Detection Heuristics

| Chain | Format | Example |
|-------|--------|---------|
| **EVM** | `0x` prefix + 64 hex chars (66 total) | `0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060` |
| **Bitcoin** | 64 hex characters (no prefix) | `e3bf3d07d4b0375638d5f1db5255fe07ba2c4cb067cd81b84ee974b6585fb468` |
| **Solana** | Base58 encoded, 86-90 characters | `5UfDuX7WXY4X3X4Gi94YcXdU8GjRqNn7dvK6Krw39e2qFjYBrtPgNE7C3UcC1oVPpJRqHqKYnNhb9dJmjMgfb1XA` |

### Additional Validation

- **EVM vs Bitcoin**: Both use hex, but EVM always has the `0x` prefix
- **Solana Detection**: Checks for Base58 characters (excludes `0`, `O`, `I`, `l`) and non-hex characters (`G`, `H`, `J`, etc.)
- **Trivial Rejection**: All-zeros or all-F hashes are rejected as invalid
- **URL Extraction**: Supports Etherscan, Polygonscan, Solscan, Mempool.space, Blockchain.com, and more

### Normalization

Input is automatically cleaned:
- Whitespace and newlines are stripped
- Explorer URLs are parsed to extract the hash
- Hex is normalized to lowercase
- `0X` prefix is converted to `0x`

## Local History

Tx Whisperer stores your recent transaction lookups in **localStorage**:

- Last 20 transactions are saved
- History persists across browser sessions
- One-click to re-analyze any previous hash
- Clear all history with a single button
- **No data is sent to any server**

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe codebase
- **Tailwind CSS** — Utility-first styling
- **Zero dependencies** for core detection logic

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/emmi-lili/tx-whisperer.git
cd tx-whisperer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

The project includes unit-like tests that run without a test framework:

```bash
npx tsx lib/tx.test.ts
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
tx-whisperer/
├── app/
│   ├── globals.css      # Global styles and animations
│   ├── layout.tsx       # Root layout with ToastProvider
│   └── page.tsx         # Main application page
├── components/
│   ├── ChainBadge.tsx   # Chain type badge display
│   ├── ExplorerLinks.tsx # Explorer links with copy buttons
│   ├── HistoryList.tsx  # Transaction history sidebar
│   ├── SampleHashes.tsx # Sample hashes for testing
│   ├── Toast.tsx        # Toast notification system
│   └── TxInputCard.tsx  # Main input form
├── lib/
│   ├── storage.ts       # localStorage utilities
│   ├── tx.ts            # Core detection logic
│   └── tx.test.ts       # Unit tests
└── README.md
```

## Next Steps

Planned improvements and features:

### Short Term
- [ ] Add keyboard shortcut (`Cmd/Ctrl + V`) for quick paste
- [ ] Support more chains: Cosmos, Tron, Ripple, Cardano
- [ ] Dark/light theme toggle
- [ ] PWA support for offline use

### Medium Term
- [ ] Optional RPC verification to confirm transaction exists
- [ ] Display basic transaction info (status, block number)
- [ ] Browser extension for right-click detection
- [ ] Shareable links with hash pre-filled

### Long Term
- [ ] Address detection (not just transactions)
- [ ] Batch detection for multiple hashes
- [ ] API endpoint for programmatic access
- [ ] Chain-specific decoders (show token transfers, NFT mints, etc.)

## Limitations

- **Heuristics only**: Detection is based on format, not verification. A valid-looking hash may not exist on-chain.
- **EVM ambiguity**: Cannot distinguish between Ethereum, Polygon, Arbitrum, etc. — they all use the same format.
- **Bitcoin variants**: Does not differentiate between Bitcoin mainnet, testnet, or forks like Bitcoin Cash.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with curiosity by [@emmi-lili](https://github.com/emmi-lili)
