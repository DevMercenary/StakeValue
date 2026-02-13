# MIDL Network Integration Guide

## What is MIDL?

[MIDL](https://midl.xyz) is a Bitcoin-native EVM -- a smart contract platform where every EVM transaction is secured by a Bitcoin transaction. This means:

- EVM state changes are anchored in Bitcoin blocks
- Users sign with their **Bitcoin wallets** (not MetaMask)
- Transactions use a special type `0x7` that includes BTC signature data

## Key Concepts

### Transaction Type 0x7

MIDL extends the standard EVM transaction with BTC-specific fields:

```json
{
  "type": "0x7",
  "to": "0x...",
  "data": "0x...",
  "btcTxHash": "0x...",
  "publicKey": "0x...",
  "btcAddressByte": "0x..."
}
```

Standard `eth_sendTransaction` (wagmi's `useWriteContract`) sends zeroed BTC fields, causing "unknown account" errors. You must use the MIDL intention pipeline instead.

### Intention Pipeline

The MIDL SDK uses a 4-step pipeline to execute EVM transactions:

```
1. Add Intention     -- Register EVM call in the MIDL store
2. Finalize          -- Construct a BTC transaction wrapping EVM calls
3. Sign              -- User signs BTC transaction in wallet
4. Send              -- Broadcast BTC + EVM transactions to network
```

## Frontend Integration

### Provider Setup

```tsx
// global/providers/Web3Provider.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { MidlProvider } from "@midl/react";
import { SatoshiKitProvider } from "@midl/satoshi-kit";
import { WagmiMidlProvider } from "@midl/executor-react";

export function Web3Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MidlProvider config={midlConfig}>
        <SatoshiKitProvider>
          <WagmiMidlProvider>
            {children}
          </WagmiMidlProvider>
        </SatoshiKitProvider>
      </MidlProvider>
    </QueryClientProvider>
  );
}
```

### MIDL Config

```typescript
// app/config.ts
import { createMidlConfig } from "@midl/satoshi-kit";
import { MaestroSymphonyProvider } from "@midl/core";
import { regtest } from "@midl/core/networks";

export const midlConfig = createMidlConfig({
  networks: [regtest],
  persist: true,
  runesProvider: {
    regtest: new MaestroSymphonyProvider({
      regtest: "https://runes.staging.midl.xyz",
    }),
  },
});
```

### Writing Contracts (useMidlWrite)

The custom `useMidlWrite` hook replaces Wagmi's `useWriteContract`:

```typescript
import {
  useAddTxIntention,
  useFinalizeBTCTransaction,
  useSignIntentions,
  useSendBTCTransactions,
} from "@midl/executor-react";
import { encodeFunctionData } from "viem";

export function useMidlWrite() {
  const { addTxIntentionAsync } = useAddTxIntention();
  const { finalizeBTCTransactionAsync } = useFinalizeBTCTransaction();
  const { signIntentionsAsync } = useSignIntentions();
  const { sendBTCTransactionsAsync } = useSendBTCTransactions();

  const writeContract = async ({ abi, address, functionName, args }) => {
    const data = encodeFunctionData({ abi, functionName, args });

    // 1. Register EVM call as intention
    await addTxIntentionAsync({
      intention: { evmTransaction: { to: address, data } },
      reset: true,
    });

    // 2. Construct BTC transaction
    const finalized = await finalizeBTCTransactionAsync();

    // 3. User signs in wallet popup
    const signed = await signIntentionsAsync({ txId: finalized.tx.id });

    // 4. Broadcast
    return sendBTCTransactionsAsync({
      serializedTransactions: signed,
      btcTransaction: finalized.tx.hex,
    });
  };

  return { writeContract, isPending, error };
}
```

### Reading Contracts

Reading is standard -- use Wagmi's `useReadContract` as normal:

```typescript
import { useReadContract } from "wagmi";

const { data: balance } = useReadContract({
  abi: erc20ABI,
  address: tokenAddress,
  functionName: "balanceOf",
  args: [userAddress],
});
```

Read calls go directly to the MIDL RPC endpoint and don't require BTC transactions.

### Available MIDL Hooks

From `@midl/executor-react`:

| Hook | Purpose |
|------|---------|
| `useEVMAddress()` | Get user's EVM address (derived from BTC key) |
| `usePublicKey()` | Get user's BTC public key |
| `useEVMChain()` | Get current EVM chain config |
| `useAddTxIntention()` | Add EVM transaction as intention |
| `useAddCompleteTxIntention()` | Add withdrawal intention |
| `useFinalizeBTCTransaction()` | Prepare BTC transaction |
| `useSignIntention()` | Sign single intention |
| `useSignIntentions()` | Sign multiple intentions |
| `useSendBTCTransactions()` | Broadcast signed transactions |
| `useClearTxIntentions()` | Clear pending intentions |
| `useEstimateBTCTransaction()` | Estimate BTC fees |
| `useBTCFeeRate()` | Get current BTC fee rate |
| `useERC20Rune()` | Get ERC20 address for a Rune |
| `useToken()` | Get token metadata |

## Hardhat Integration

### Config

```typescript
// hardhat.config.ts
import "@midl/hardhat-deploy";
import { MaestroSymphonyProvider, MempoolSpaceProvider } from "@midl/core";
import { midlRegtest } from "@midl/executor";

const config = {
  defaultNetwork: "regtest",
  networks: {
    regtest: {
      url: midlRegtest.rpcUrls.default.http[0],
      accounts: { mnemonic, path: "m/86'/1'/0'/0/0" },
      chainId: midlRegtest.id,
    },
  },
  midl: {
    path: "deployments",
    networks: {
      regtest: {
        mnemonic,
        confirmationsRequired: 1,
        btcConfirmationsRequired: 1,
        hardhatNetwork: "regtest",
        providerFactory: () => new MempoolSpaceProvider({
          regtest: "https://mempool.staging.midl.xyz",
        }),
        runesProviderFactory: () => new MaestroSymphonyProvider({
          regtest: "https://runes.staging.midl.xyz",
        }),
      },
    },
  },
};
```

### Deploy Pattern

```typescript
export default async function deploy(hre) {
  await hre.midl.initialize();
  await hre.midl.deploy("ContractName", [args]);
  await hre.midl.execute();
}
```

### Write Pattern (Scripts)

```typescript
await hre.midl.initialize();
await hre.midl.write("ContractName", "functionName", [args]);
await hre.midl.execute();
```

### Read Pattern (Scripts)

```typescript
const result = await hre.midl.read("ContractName", "functionName", [args]);
```

## Viem Override

MIDL requires a custom viem fork for BTC transaction type support:

```json
// package.json
{
  "pnpm": {
    "overrides": {
      "viem": "npm:@midl/viem@^2.45.0"
    }
  }
}
```

A `postinstall` script removes nested viem copies that bypass the override:

```json
{
  "scripts": {
    "postinstall": "node -e \"...remove nested viem copies...\""
  }
}
```

## Network Endpoints

| Service | URL |
|---------|-----|
| EVM RPC | `https://rpc.staging.midl.xyz` |
| Block Explorer | `https://blockscout.staging.midl.xyz` |
| Bitcoin Mempool | `https://mempool.staging.midl.xyz` |
| Runes API | `https://runes.staging.midl.xyz` |
| Faucet | `https://faucet.staging.midl.xyz` |

## Common Issues

### "unknown account" Error

**Cause**: Using Wagmi's `useWriteContract` directly, which sends `eth_sendTransaction` with zeroed BTC fields.

**Fix**: Use `useMidlWrite` hook instead, which goes through the intention pipeline.

### "Nothing to compile" on Deploy

**Cause**: Contracts haven't changed since last compilation.

**Fix**: This is normal -- Hardhat skips compilation when bytecode is unchanged.

### Block Confirmation Delay

**Cause**: MIDL EVM state only updates after the wrapping BTC transaction is confirmed (1 block).

**Fix**: Wait 30-60 seconds after transaction submission, then refresh the page.
