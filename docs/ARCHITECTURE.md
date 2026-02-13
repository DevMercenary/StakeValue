# Architecture

## Overview

StakeVault is a monorepo with two packages:

```
stake-value/
  apps/dapp/          # Frontend application
  packages/contracts/ # Smart contracts & deployment
```

## System Architecture

```
+-------------------+     +------------------+     +------------------+
|                   |     |                  |     |                  |
|   Bitcoin Wallet  |---->|   MIDL SDK       |---->|   MIDL Network   |
|   (XVerse)        |     |   (Executor)     |     |   (BTC + EVM)    |
|                   |     |                  |     |                  |
+-------------------+     +------------------+     +------------------+
        |                         |                        |
        |  BIP-322 Signing        |  Intention Pipeline    |  BTC Block
        |                         |                        |  Confirmation
        v                         v                        v
+-------------------+     +------------------+     +------------------+
|                   |     |                  |     |                  |
|   SatoshiKit      |     |   Transaction    |     |   StakingPool    |
|   (Connect UI)    |     |   Finalization   |     |   (Solidity)     |
|                   |     |                  |     |                  |
+-------------------+     +------------------+     +------------------+
```

## Frontend Architecture (Feature-Sliced Design)

The frontend follows a layered architecture inspired by Feature-Sliced Design:

### Layers (top to bottom)

1. **`app/`** -- Next.js App Router, page composition, global config
2. **`widgets/`** -- Complete UI blocks (Header, Stake, Unstake, StakingInfo, Rewards)
3. **`features/`** -- Business logic hooks (useStake, useUnstake, useClaimRewards, useMidlWrite)
4. **`shared/`** -- Contract ABIs, addresses, utility functions
5. **`components/ui/`** -- Dumb UI primitives from shadcn/ui
6. **`global/`** -- Provider wrappers (Web3, MIDL, React Query)

### Data Flow

```
User Action (click "Stake")
    |
    v
Widget (Stake.tsx) -- form validation, UI state
    |
    v
Feature Hook (useStake) -- business logic
    |
    v
MIDL Write Hook (useMidlWrite) -- intention pipeline
    |
    v
MIDL SDK Hooks:
  1. useAddTxIntention     -- encode & register EVM call
  2. useFinalizeBTCTransaction -- prepare BTC transaction
  3. useSignIntentions     -- wallet popup for BTC signing
  4. useSendBTCTransactions -- broadcast to network
    |
    v
MIDL Network -- BTC block confirms, EVM state updates
    |
    v
React Query -- cache invalidation, UI refresh
```

## Smart Contract Architecture

### StakingPool

```
StakingPool
  |
  |-- stakes: mapping(token => user => StakeInfo)
  |     |-- amount: uint256
  |     |-- stakedAt: uint256
  |     |-- rewardsClaimed: uint256
  |
  |-- totalStaked: mapping(token => uint256)
  |
  |-- REWARD_RATE_PER_SECOND: 3170979198 (~10% APY)
  |
  |-- stake(token, amount)      -- deposit tokens + auto-claim rewards
  |-- unstake(token, amount)    -- withdraw tokens + auto-claim rewards
  |-- claimRewards(token)       -- claim accumulated rewards
  |-- rewardPoolBalance(token)  -- check available rewards
```

### Reward Mechanism

The contract uses a simple time-based reward model:

```
rewards = stakedAmount * REWARD_RATE_PER_SECOND * (now - stakedAt) / 1e18
```

- Rewards are paid from a **reward pool** (tokens deposited into the contract)
- Auto-claimed on every stake/unstake action
- `rewardPoolBalance()` returns `contractBalance - totalStaked`

### Security

- Uses OpenZeppelin's `SafeERC20` for safe token transfers
- Custom errors for gas-efficient reverts
- No admin functions -- fully permissionless
- Re-entrancy safe (state updated before external calls)

## Provider Stack

The frontend wraps the app in a carefully ordered provider stack:

```tsx
<QueryClientProvider>     // React Query for data fetching
  <MidlProvider>          // MIDL network configuration
    <SatoshiKitProvider>  // Bitcoin wallet UI (connect modal)
      <WagmiMidlProvider> // Wagmi + MIDL EVM bridge
        {children}
      </WagmiMidlProvider>
    </SatoshiKitProvider>
  </MidlProvider>
</QueryClientProvider>
```

## Key Design Decisions

### Why `useMidlWrite` instead of Wagmi's `useWriteContract`?

MIDL EVM uses transaction type `0x7` which requires BTC signature data (`btcTxHash`, `publicKey`, `btcAddressByte`). Standard `eth_sendTransaction` sends zeroed BTC fields, causing "unknown account" errors. The MIDL intention pipeline properly constructs and signs these transactions.

### Why pnpm override for viem?

MIDL uses a custom viem fork (`@midl/viem`) that adds BTC transaction type support. Without the override, nested dependencies install the standard viem, causing type conflicts and runtime errors.

### Why MockERC20 instead of Runes?

The Rune-to-EVM bridge has an amount mapping issue (edict amounts don't translate correctly to ERC20 balances). MockERC20 provides a reliable token for demonstrating the full staking flow while the Rune bridge matures.
