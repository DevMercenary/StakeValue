# Smart Contracts Documentation

## Overview

StakeVault uses two smart contracts deployed on MIDL Regtest:

| Contract | Purpose | Address |
|----------|---------|---------|
| **StakingPool** | Core staking, unstaking, and reward distribution | `0x0D46524CB2B78D67ae78e2621a872C794D38691A` |
| **MockERC20** | Test ERC20 token (STAKEVAULT / SV) | `0x2112Ab69233fF97fab9cd7F2a45ab706D6D57f81` |

---

## StakingPool

### Source: `packages/contracts/contracts/StakingPool.sol`

A permissionless staking pool that supports any ERC20 token. Users deposit tokens and earn time-based rewards from a reward pool.

### Functions

#### `stake(address token, uint256 amount)`

Stake ERC20 tokens into the pool.

- Requires prior ERC20 `approve()` for the StakingPool address
- Automatically claims any pending rewards before staking
- Emits `Staked(user, token, amount)`

```solidity
// Example: stake 100 SV tokens
IERC20(svToken).approve(stakingPool, 100e18);
StakingPool(stakingPool).stake(svToken, 100e18);
```

#### `unstake(address token, uint256 amount)`

Withdraw staked tokens from the pool.

- Automatically claims pending rewards before unstaking
- Reverts with `InsufficientBalance` if amount exceeds staked balance
- Emits `Unstaked(user, token, amount)`

#### `claimRewards(address token)`

Claim accumulated staking rewards.

- Rewards are transferred as actual ERC20 tokens from the reward pool
- Resets the reward calculation timer (`stakedAt = block.timestamp`)
- Emits `RewardsClaimed(user, token, amount)`

#### `getStakedBalance(address token, address user) -> uint256`

Returns the amount of tokens currently staked by a user.

#### `getPendingRewards(address token, address user) -> uint256`

Returns the unclaimed rewards for a user. Calculated as:

```
rewards = stakedAmount * REWARD_RATE_PER_SECOND * (block.timestamp - stakedAt) / 1e18
```

#### `getStakeInfo(address token, address user) -> (amount, stakedAt, rewardsClaimed)`

Returns detailed staking information for a user:
- `amount` -- tokens currently staked
- `stakedAt` -- timestamp of last stake/claim action
- `rewardsClaimed` -- total rewards claimed historically

#### `totalStaked(address token) -> uint256`

Returns the total amount of a specific token staked across all users.

#### `rewardPoolBalance(address token) -> uint256`

Returns how many tokens are available for reward distribution:

```
rewardPool = contractBalance - totalStaked
```

#### `REWARD_RATE_PER_SECOND -> uint256`

Constant: `3170979198`

Calculated as: `0.10 * 1e18 / (365.25 * 24 * 3600)` which gives approximately 10% APY.

### Events

| Event | Parameters | Description |
|-------|-----------|-------------|
| `Staked` | `user (indexed), token (indexed), amount` | Emitted when tokens are staked |
| `Unstaked` | `user (indexed), token (indexed), amount` | Emitted when tokens are unstaked |
| `RewardsClaimed` | `user (indexed), token (indexed), amount` | Emitted when rewards are claimed |

### Errors

| Error | When |
|-------|------|
| `InvalidTokenAddress` | Token address is zero |
| `InvalidAmount` | Amount is zero |
| `InsufficientBalance` | Unstake amount exceeds staked balance |

---

## MockERC20

### Source: `packages/contracts/contracts/MockERC20.sol`

A standard ERC20 token with configurable decimals, used for testing.

### Constructor

```solidity
constructor(
    string memory name_,      // "STAKEVAULT"
    string memory symbol_,    // "SV"
    uint8 decimals_,          // 18
    uint256 initialSupply     // 10000e18
)
```

All initial supply is minted to the deployer address.

---

## Deployment

### MIDL Deploy Pattern

MIDL uses a custom Hardhat plugin for deployments. Each deploy script follows this pattern:

```typescript
export default async function deploy(hre: HardhatRuntimeEnvironment) {
    await hre.midl.initialize();
    await hre.midl.deploy("ContractName", [constructorArgs]);
    await hre.midl.execute();
}
```

### Deploy Scripts

| Script | Purpose |
|--------|---------|
| `00_StakingPool.ts` | Deploy StakingPool contract |
| `02_BridgeRune.ts` | Map Bitcoin Rune to EVM ERC20 |
| `03_TransferRuneToEVM.ts` | Transfer Rune tokens to EVM via edict |
| `04_MockERC20.ts` | Deploy MockERC20 (STAKEVAULT, SV) |

### Deployment Commands

```bash
cd packages/contracts

# Deploy all (runs scripts in order)
npx hardhat deploy --network regtest

# Fund reward pool with 1000 SV tokens
npx hardhat run scripts/fundRewardPool.ts --network regtest

# Check all balances
npx hardhat run scripts/checkBalance.ts --network regtest
```

---

## Reward Pool Management

The StakingPool contract distributes rewards from tokens held in excess of the total staked amount. To fund the reward pool:

1. Transfer ERC20 tokens directly to the StakingPool address
2. Or use the `fundRewardPool.ts` script

```bash
# Fund with 1000 SV tokens from deployer
npx hardhat run scripts/fundRewardPool.ts --network regtest
```

### Monitoring

```bash
# Check reward pool balance
npx hardhat run scripts/checkBalance.ts --network regtest
```

Output example:
```
=== StakingPool: 0x0D46...691A ===
  Total staked (SV): 100
  Reward pool: 900
```
