export interface TokenInfo {
  symbol: string;
  name: string;
  id: string;
  icon: string;
  image?: string;
  images?: string[];
  address: `0x${string}` | undefined;
  decimals: number;
  balance: string;
  balanceUSD: string;
  price: string;
}

export interface VaultInfo {
  symbol: string;
  name: string;
  id: string;
  icon: string;
  image?: string;
  images?: string[];
  address: `0x${string}`;
  vaultAddress: `0x${string}`;
  decimals: number;
  vaultDecimals: number;
  balance: string;
  balanceUSD: string;
  vaultSymbol: string;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  image?: string;
  images?: string[];
}

export interface AnalyticsData {
  action: string;
  fid: number;
  tokenSymbol: string;
  tokenAddress: string;
  amount: string;
  vaultAddress?: string;
  vaultSymbol?: string;
  txHash: string;
  chainId: number;
  walletAddress: string;
  timestamp: string;
}

export interface ConvertModalProps {
  chainId: number;
  isOpen: boolean;
  onClose: () => void;
  fid: number;
  selectedToken: TokenInfo;
  depositAmount: string;
  vaultAddress: `0x${string}` | null;
  onSuccess?: () => void;
  walletAddress: `0x${string}` | null;
  handleWalletInteraction: (action: () => Promise<void>) => Promise<void>;
}

export interface RevertModalProps {
  chainId: number;
  isOpen: boolean;
  onClose: () => void;
  fid: number | undefined;
  selectedToken: TokenInfo;
  withdrawAmount: string;
  selectedVault: VaultInfo;
  onSuccess?: () => void;
  walletAddress: `0x${string}` | null;
  handleWalletInteraction: (action: () => Promise<void>) => Promise<void>;
}

export interface UserBalancesProps {
  vault: VaultInfo;
  balance: TokenInfo | null;
}

export interface VaultCardProps {
  vault: VaultInfo;
  isSelected: boolean;
  onSelect: () => void;
}
