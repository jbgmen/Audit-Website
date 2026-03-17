
import { BrowserProvider, parseUnits, Contract, JsonRpcProvider } from 'ethers';

/**
 * VELACORE MULTI-CHAIN $VEC TESTNET CONFIGURATION
 */

export type SupportedNetwork = 'BSC' | 'FLOW' | 'CCREDIT';

export interface NetworkConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorer: string;
  tokenAddress: string;
  symbol: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const NETWORKS: Record<SupportedNetwork, NetworkConfig> = {
  BSC: {
    name: 'BSC Testnet',
    chainId: '0x61', // 97
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorer: 'https://testnet.bscscan.com',
    tokenAddress: '0x0000000000000000000000000000000000000000', // REPLACE: $VEC on BSC Testnet
    symbol: 'tBNB',
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 }
  },
  FLOW: {
    name: 'Flow Testnet (EVM)',
    chainId: '0x211', // 545
    rpcUrl: 'https://testnet.evm.nodes.onflow.org',
    explorer: 'https://testnet.evm.flowscan.io',
    tokenAddress: '0x0000000000000000000000000000000000000000', // REPLACE: $VEC on Flow Testnet
    symbol: 'FLOW',
    nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 }
  },
  CCREDIT: {
    name: 'CCredit Testnet',
    chainId: '0x13882', // Placeholder: Amoy/Mumbai style
    rpcUrl: 'https://rpc-amoy.polygon.technology/', 
    explorer: 'https://amoy.polygonscan.com',
    tokenAddress: '0x0000000000000000000000000000000000000000', // REPLACE: $VEC on CCredit Testnet
    symbol: 'CCRT',
    nativeCurrency: { name: 'CCredit', symbol: 'CCRT', decimals: 18 }
  }
};

const GLOBAL_CONFIG = {
  DECIMALS: 18,
  VEC_USD_PRICE: 1.23, // Updated to $1.23 as requested
  VEC_DISCOUNT: 0.10,
  RECIPIENT_ADDRESS: '0x8829A772B1234567890abcdef1234567890abcde', // Exactly 42 characters (0x + 40 hex)
};

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function symbol() public view returns (string)"
];

export const getVecAmount = (usdValue: number) => {
  const discountedUsd = usdValue * (1 - GLOBAL_CONFIG.VEC_DISCOUNT);
  // Calculation based on $1.23 per token
  return Math.ceil(discountedUsd / GLOBAL_CONFIG.VEC_USD_PRICE);
};

export const switchNetwork = async (networkKey: SupportedNetwork) => {
  const network = NETWORKS[networkKey];
  if (!(window as any).ethereum) throw new Error("MetaMask not detected.");

  try {
    await (window as any).ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainId,
          chainName: network.name,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.explorer]
        }],
      });
    } else {
      throw switchError;
    }
  }
};

export const sendVecPayment = async (amountUsd: number, networkKey: SupportedNetwork) => {
  if (!(window as any).ethereum) throw new Error("MetaMask not detected.");
  
  await switchNetwork(networkKey);
  
  const provider = new BrowserProvider((window as any).ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  
  const network = NETWORKS[networkKey];
  const vecAmount = getVecAmount(amountUsd);
  const amountToTransfer = parseUnits(vecAmount.toString(), GLOBAL_CONFIG.DECIMALS);

  const tokenContract = new Contract(network.tokenAddress, ERC20_ABI, signer);

  try {
    const tx = await tokenContract.transfer(GLOBAL_CONFIG.RECIPIENT_ADDRESS, amountToTransfer);
    return {
      hash: tx.hash,
      amount: vecAmount,
      network: network.name,
      wait: () => tx.wait()
    };
  } catch (err: any) {
    if (err.code === 'ACTION_REJECTED') throw new Error("Authorization rejected by operator.");
    throw err;
  }
};

export const verifyTransactionOnChain = async (txHash: string, networkKey: SupportedNetwork) => {
  const network = NETWORKS[networkKey];
  const provider = new JsonRpcProvider(network.rpcUrl);
  
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) throw new Error("Transaction not found on the network.");
    
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) throw new Error("Transaction is still pending. Please wait.");
    
    if (receipt.status !== 1) throw new Error("Transaction failed on the blockchain.");
    
    // In a real app, we would also verify the logs for the correct token, recipient, and amount.
    // For this testnet demo, we verify the transaction exists and was successful.
    return {
      success: true,
      from: tx.from,
      to: tx.to
    };
  } catch (err: any) {
    throw new Error(err.message || "Could not verify transaction.");
  }
};

export const CRYPTO_CONFIG = GLOBAL_CONFIG;
export const RECIPIENT_ADDRESS = GLOBAL_CONFIG.RECIPIENT_ADDRESS;
