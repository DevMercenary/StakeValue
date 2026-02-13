<p align="center">
  <img src="https://img.shields.io/badge/Bitcoin-Staking-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" />
  <img src="https://img.shields.io/badge/MIDL-Network-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
</p>

# StakeVault - Bitcoin Staking Platform

**StakeVault** is a full-stack Bitcoin staking platform built on the [MIDL Network](https://midl.xyz) -- a Bitcoin-native EVM that enables smart contract execution secured by Bitcoin.

Users connect their Bitcoin wallet, stake ERC20 tokens on the EVM layer, and earn ~10% APY rewards -- all powered by Bitcoin transactions under the hood.

---

## Architecture

```
stake-value/
  apps/
    dapp/                   # Next.js 16 frontend (React 19, Tailwind v4)
      src/
        app/                # Next.js App Router pages & layout
        components/ui/      # shadcn/ui primitives (Button, Card, Tabs, etc.)
        features/           # Business logic hooks (staking, rune store)
        global/             # Providers (Web3, MIDL, Wagmi)
        shared/             # Contract ABIs, addresses, utilities
        widgets/            # Page-level UI components
  packages/
    contracts/              # Hardhat + Solidity smart contracts
      contracts/            # StakingPool.sol, MockERC20.sol
      deploy/               # MIDL deployment scripts
      scripts/              # Utility scripts (balance checks, funding)
      deployments/          # Deployed contract addresses & ABIs
```

### How MIDL Works

MIDL is unique: every EVM transaction is **wrapped inside a Bitcoin transaction**. When a user stakes tokens:

1. The dApp encodes the EVM call (e.g., `stake(token, amount)`)
2. The MIDL SDK wraps it as a **transaction intention**
3. A Bitcoin transaction is constructed containing the EVM calldata
4. The user signs with their **Bitcoin wallet** (XVerse, Leather, etc.)
5. The signed BTC transaction is broadcast, executing the EVM call on confirmation

This means all EVM state changes are secured by Bitcoin's proof-of-work.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contracts** | Solidity 0.8.28, OpenZeppelin, Hardhat |
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Web3** | Wagmi, Viem (MIDL fork), MIDL SDK v3 |
| **Wallet** | SatoshiKit (XVerse, Leather, UniSat) |
| **State** | Zustand, TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Monorepo** | pnpm workspaces |

---

## Smart Contracts

### StakingPool.sol

The core staking contract supporting **any ERC20 token**. Features:

- **Multi-token staking** -- stake any ERC20 via `stake(token, amount)`
- **Time-based rewards** -- ~10% APY calculated per-second
- **Real reward payouts** -- `claimRewards()` transfers actual tokens from the reward pool
- **Reward pool tracking** -- `rewardPoolBalance(token)` shows available rewards
- **Auto-claim on actions** -- rewards are auto-claimed on stake/unstake

```solidity
// Core functions
function stake(address token, uint256 amount) external;
function unstake(address token, uint256 amount) external;
function claimRewards(address token) external;

// View functions
function getStakedBalance(address token, address user) external view returns (uint256);
function getPendingRewards(address token, address user) external view returns (uint256);
function rewardPoolBalance(address token) external view returns (uint256);
function totalStaked(address token) external view returns (uint256);
```

### MockERC20.sol

A simple ERC20 token for testing. Deployed as **STAKEVAULT (SV)** with 18 decimals and 10,000 initial supply.

---

## Features

### Staking Flow
1. Connect Bitcoin wallet via SatoshiKit
2. Approve token spending (ERC20 approve via MIDL BTC transaction)
3. Stake tokens -- tokens are transferred to StakingPool contract
4. Watch rewards accumulate in real-time (~10% APY)
5. Claim rewards -- SV tokens are transferred to your wallet
6. Unstake -- retrieve your staked tokens at any time

### MIDL Transaction Integration
All EVM writes go through the custom `useMidlWrite` hook:
```
addTxIntention -> finalizeBTCTransaction -> signIntentions -> sendBTCTransactions
```
This 4-step pipeline wraps any EVM call into a Bitcoin transaction, signed by the user's BTC wallet.

### UI Components
- **Staking Pool** -- contract info, total staked, APY badge, user balance
- **Manage Stake** -- tabbed Stake/Unstake interface with form validation
- **Rewards** -- pending rewards display with real-time refresh and claim button
- **Header** -- wallet connection, network links (Explorer, Mempool, Faucet)

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Bitcoin wallet** browser extension (XVerse recommended)

### Installation

```bash
git clone https://github.com/your-username/stake-value.git
cd stake-value
pnpm install
```

### Environment Setup

Set the mnemonic for contract deployment:

```bash
cd packages/contracts
npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase here"
```

### Compile Contracts

```bash
pnpm compile
```

### Deploy Contracts (MIDL Regtest)

```bash
cd packages/contracts

# Deploy StakingPool
npx hardhat deploy --network regtest

# Deploy MockERC20 token
npx hardhat run deploy/04_MockERC20.ts --network regtest

# Fund the reward pool (1000 SV tokens)
npx hardhat run scripts/fundRewardPool.ts --network regtest
```

### Start Development Server

```bash
pnpm dev
# Opens at http://localhost:3000
```

### Connect Wallet

1. Install [XVerse wallet](https://www.xverse.app/) browser extension
2. Switch to **Testnet** in XVerse settings
3. Get test BTC from [MIDL Faucet](https://faucet.staging.midl.xyz)
4. Open `http://localhost:3000` and click **Connect Wallet**

---

## Project Structure (Detailed)

### Frontend (`apps/dapp/`)

```
src/
  app/
    config.ts           # MIDL config, React Query client
    globals.css         # Tailwind v4 theme (dark mode, custom colors)
    layout.tsx          # Root layout with providers
    page.tsx            # Home page with staking UI

  components/ui/        # shadcn/ui primitives
    badge.tsx, button.tsx, card.tsx, input.tsx,
    label.tsx, separator.tsx, sonner.tsx, tabs.tsx, tooltip.tsx

  features/
    rune/
      api/useRuneStore.ts   # Zustand store for Rune ID selection
    staking/
      api/useMidlWrite.ts   # Core MIDL EVM transaction hook
      api/useStake.ts       # Stake tokens via MIDL
      api/useUnstake.ts     # Unstake tokens via MIDL
      api/useClaimRewards.ts # Claim rewards via MIDL

  global/
    providers/
      Web3Provider.tsx  # QueryClient + MidlProvider + SatoshiKit + WagmiMidl

  shared/
    contracts/
      StakingPool.ts    # Contract address, ABI, token constants
    utils/
      index.ts          # shortenAddress helper

  widgets/
    header/             # Navigation bar with ConnectButton
    stake/              # Stake form with approve flow
    unstake/            # Unstake form
    staking-info/       # Pool stats display
    rewards/            # Pending rewards + claim
    rune-select/        # Rune ID input (for Rune-based staking)
```

### Smart Contracts (`packages/contracts/`)

```
contracts/
  StakingPool.sol       # Core staking contract with reward payouts
  MockERC20.sol         # Test ERC20 token

deploy/
  00_StakingPool.ts     # Deploy StakingPool via MIDL
  02_BridgeRune.ts      # Bridge Bitcoin Rune to EVM ERC20
  03_TransferRuneToEVM.ts # Transfer Rune tokens to EVM
  04_MockERC20.ts       # Deploy MockERC20 token

scripts/
  checkBalance.ts       # Check all balances (Native BTC, SV, Rune)
  fundRewardPool.ts     # Fund StakingPool with reward tokens
  showAddresses.ts      # Display wallet addresses
  testStakingFlow.ts    # End-to-end staking test script

deployments/
  StakingPool.json      # Deployed address + ABI
  MockERC20.json        # Deployed address + ABI
```

---

## Key Technical Details

### MIDL Transaction Flow (`useMidlWrite`)

The custom hook replaces Wagmi's `useWriteContract` for MIDL compatibility:

```typescript
// 1. Encode EVM calldata
const data = encodeFunctionData({ abi, functionName, args });

// 2. Add as MIDL intention
await addTxIntentionAsync({
  intention: { evmTransaction: { to: address, data } },
  reset: true,
});

// 3. Prepare BTC transaction wrapping EVM calls
const finalized = await finalizeBTCTransactionAsync();

// 4. User signs with Bitcoin wallet (XVerse popup)
const signed = await signIntentionsAsync({ txId: finalized.tx.id });

// 5. Broadcast signed BTC + EVM transaction
await sendBTCTransactionsAsync({
  serializedTransactions: signed,
  btcTransaction: finalized.tx.hex,
});
```

### Viem Override

MIDL uses a custom fork of viem (`@midl/viem`) for BTC transaction type support. The root `package.json` overrides viem globally, and a `postinstall` script removes nested viem copies to prevent conflicts.

### Reward Calculation

Rewards are calculated per-second based on staked amount:

```
rewards = (stakedAmount * REWARD_RATE_PER_SECOND * duration) / 1e18
```

Where `REWARD_RATE_PER_SECOND = 3170979198` corresponds to ~10% APY.

---

## Deployed Contracts (MIDL Regtest)

| Contract | Address |
|----------|---------|
| **StakingPool** | `0x0D46524CB2B78D67ae78e2621a872C794D38691A` |
| **MockERC20 (SV)** | `0x2112Ab69233fF97fab9cd7F2a45ab706D6D57f81` |

---

## Network Links

| Resource | URL |
|----------|-----|
| Block Explorer | https://blockscout.staging.midl.xyz |
| Bitcoin Mempool | https://mempool.staging.midl.xyz |
| Faucet | https://faucet.staging.midl.xyz |
| Token Minter | https://runes.midl.xyz |
| MIDL Network | https://midl.xyz |

---

## Scripts Reference

```bash
# Root
pnpm dev              # Start frontend dev server
pnpm build            # Build frontend for production
pnpm compile          # Compile Solidity contracts

# packages/contracts
npx hardhat deploy --network regtest              # Deploy all contracts
npx hardhat run scripts/checkBalance.ts --network regtest   # Check balances
npx hardhat run scripts/fundRewardPool.ts --network regtest # Fund rewards
```

---

## License

MIT

---

<p align="center">
  Built with MIDL Network -- Bitcoin-native smart contracts
</p>
