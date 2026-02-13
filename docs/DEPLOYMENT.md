# Deployment Guide

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- A Bitcoin wallet mnemonic (for contract deployment)
- Test BTC from [MIDL Faucet](https://faucet.staging.midl.xyz)

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
git clone https://github.com/your-username/stake-value.git
cd stake-value
pnpm install
```

The `postinstall` script automatically removes nested viem copies to prevent MIDL compatibility issues.

### 2. Configure Mnemonic

```bash
cd packages/contracts
npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase here"
```

This mnemonic derives both:
- **BTC address** (for signing and funding transactions)
- **EVM address** (for deploying contracts, derived from BTC key)

### 3. Get Test BTC

Visit [https://faucet.staging.midl.xyz](https://faucet.staging.midl.xyz) and enter your BTC address.

To find your BTC address:
```bash
npx hardhat run scripts/showAddresses.ts --network regtest
```

### 4. Compile Contracts

```bash
cd packages/contracts
npx hardhat compile
```

### 5. Deploy StakingPool

```bash
npx hardhat deploy --network regtest
```

This runs `deploy/00_StakingPool.ts` and saves the result to `deployments/StakingPool.json`.

Note the contract address in the output -- you'll need it for the frontend config.

### 6. Deploy MockERC20 Token

```bash
npx hardhat run deploy/04_MockERC20.ts --network regtest
```

Deploys a MockERC20 token with:
- Name: STAKEVAULT
- Symbol: SV
- Decimals: 18
- Initial supply: 10,000 tokens (minted to deployer)

### 7. Fund the Reward Pool

Transfer tokens to the StakingPool so it can pay out rewards:

```bash
npx hardhat run scripts/fundRewardPool.ts --network regtest
```

This transfers 1,000 SV tokens from the deployer to the StakingPool contract.

### 8. Transfer Tokens to Users

If you need to send test tokens to specific addresses, modify and run:

```bash
npx hardhat run scripts/transferMockTokens.ts --network regtest
```

### 9. Update Frontend Config

Update the contract addresses in `apps/dapp/src/shared/contracts/StakingPool.ts`:

```typescript
export const address = "0x<NEW_STAKING_POOL_ADDRESS>" as const;
export const STAKEVAULT_ADDRESS = "0x<NEW_MOCK_ERC20_ADDRESS>" as const;
```

### 10. Verify Deployment

```bash
npx hardhat run scripts/checkBalance.ts --network regtest
```

Expected output:
```
=== User: 0x... ===
  Native BTC: X.XXX
  STAKEVAULT (SV): XXXX

=== StakingPool: 0x... ===
  Total staked (SV): 0
```

### 11. Start Frontend

```bash
cd ../..  # back to root
pnpm dev
```

Open http://localhost:3000 in a browser with XVerse wallet installed.

---

## Verify on Blockscout

```bash
cd packages/contracts
npx hardhat verify --network regtest <CONTRACT_ADDRESS>
```

---

## Redeployment

To redeploy a contract after code changes:

1. Delete the deployment file:
   ```bash
   rm deployments/StakingPool.json
   ```

2. Temporarily move other deploy scripts:
   ```bash
   mkdir deploy_bak
   mv deploy/02_*.ts deploy/03_*.ts deploy/04_*.ts deploy_bak/
   ```

3. Deploy:
   ```bash
   npx hardhat deploy --network regtest
   ```

4. Restore scripts:
   ```bash
   mv deploy_bak/*.ts deploy/
   rmdir deploy_bak
   ```

5. Re-fund reward pool:
   ```bash
   npx hardhat run scripts/fundRewardPool.ts --network regtest
   ```

6. Update contract address in frontend.

---

## Production Considerations

This is an MVP on regtest. For production deployment:

- [ ] Add access control (owner/admin for reward management)
- [ ] Add emergency pause functionality
- [ ] Implement proper reward rate governance
- [ ] Add slashing conditions
- [ ] Security audit of StakingPool contract
- [ ] Deploy to MIDL mainnet
- [ ] Set up monitoring and alerting
- [ ] Configure proper CORS and rate limiting
