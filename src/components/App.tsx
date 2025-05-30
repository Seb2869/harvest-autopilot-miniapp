import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import type { JSX } from "react";
import BigNumber from "bignumber.js";
import sdk from "@farcaster/frame-sdk";
import { Button } from "~/components/Button";
import { base } from "wagmi/chains";
import ConvertTokenSelectModal from "./convert/TokenSelectModal";
import RevertTokenSelectModal from "./revert/TokenSelectModal";
import VaultCard from "./VaultCard";
import UserBalances from "./UserBalances";
import ConvertModal from "./convert/ConvertModal";
import RevertModal from "./revert/RevertModal";
import type { TokenInfo, VaultInfo, Token } from "~/types";
import { usePortals } from "~/providers/Portals";
import { formatBalance } from "~/utilities/parsers";

import { SUPPORTED_VAULTS, FALLBACK_TOKEN_ICON } from "~/constants";

export default function App(): JSX.Element {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [fid, setFid] = useState<number>(0);
  const [mode, setMode] = useState<"convert" | "revert">("convert");
  const [selectedVault, setSelectedVault] = useState<string | null>("USDC");
  const [vaultBalances, setVaultBalances] = useState<{
    [key: string]: TokenInfo | null;
  }>({});
  const [selectedToken, setSelectedToken] = useState<TokenInfo>({
    symbol: "USDC",
    name: "USD Coin",
    id: "IPOR_USDC_base",
    icon: "/images/tokens/usdc.svg",
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    decimals: 6,
    balance: "0",
    balanceUSD: "0",
    price: "0",
    images: ["/images/tokens/usdc.svg"],
  });
  const [depositAmount, setDepositAmount] = useState<string>("0");
  const [vaultAddress, setVaultAddress] = useState<`0x${string}` | null>(null);
  const [isConvertTokenModalOpen, setIsConvertTokenModalOpen] = useState(false);
  const [isRevertTokenModalOpen, setIsRevertTokenModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenInfo[]>([]);
  const { getPortalsBalances, SUPPORTED_TOKEN_LIST, getPortalsBaseTokens } =
    usePortals();
  const [walletAddress, setWalletAddress] = useState<`0x${string}` | null>(
    null,
  );
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const chainId: number = base.id;
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [supportedTokens, setSupportedTokens] = useState<TokenInfo[]>([]);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isWalletInteracting, setIsWalletInteracting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const POLLING_INTERVAL = 5000; // 5 seconds polling interval

  // Show notification function
  const showNotification = (
    message: string,
    type: "error" | "success" = "error",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 10000); // Auto-hide after 10 seconds
  };

  // Helper to safely get vault balance
  const getVaultBalance = (vaultSymbol: string | null): TokenInfo | null => {
    if (!vaultSymbol) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return vaultBalances[vaultSymbol as any] || null;
  };

  // Set initial vault address for USDC
  useEffect(() => {
    setVaultAddress(SUPPORTED_VAULTS[0].vaultAddress as `0x${string}`);
    setSelectedVault("USDC");
  }, []);

  // Handle wallet interactions
  const handleWalletInteraction = async (action: () => Promise<void>) => {
    try {
      setIsWalletInteracting(true);
      await action();
    } finally {
      // Add a small delay before re-enabling polling
      setTimeout(() => {
        setIsWalletInteracting(false);
      }, 2000); // 2 second delay
    }
  };

  // Polling mechanism to detect wallet changes
  useEffect(() => {
    let isComponentMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastCheckedAddress: string | null = null;

    const checkWalletChanges = async () => {
      if (!isComponentMounted || isWalletInteracting) return;

      try {
        const provider = await sdk.wallet.getEthereumProvider();
        if (!provider) return;

        // Only check for account changes, not balances
        const accounts = await provider.request({ method: "eth_accounts" });
        const newAddress = accounts?.[0]?.toLowerCase() || null;

        // Return early if address hasn't changed
        if (newAddress === lastCheckedAddress) {
          return;
        }

        // Update our last checked address
        lastCheckedAddress = newAddress;

        if (newAddress) {
          setWalletAddress(newAddress as `0x${string}`);
          setIsWalletConnected(true);

          // Start polling if not already polling
          if (!pollInterval) {
            pollInterval = setInterval(checkWalletChanges, POLLING_INTERVAL);
          }
        } else {
          setWalletAddress(null);
          setIsWalletConnected(false);
          setTokenBalances([]);
          setVaultBalances({});
          setSupportedTokens([]);

          // Clear polling if wallet disconnected
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        }
      } catch (error) {
        console.error("Failed to check wallet changes:", error);
        // Clear polling on error
        if (pollInterval) {
          console.log("Clearing polling interval - error occurred");
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    // Run initial check
    checkWalletChanges();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isWalletInteracting]); // Add isWalletInteracting to dependencies

  // Load SDK and connect
  useEffect(() => {
    const load = async () => {
      try {
        // Initialize SDK with error handling
        try {
          const frameContext = await sdk.context;
          setFid(frameContext?.user?.fid);
          if (!frameContext) {
            setSdkError("Please open this app in Warpcast");
            return;
          }

          const provider = await sdk.wallet.getEthereumProvider();
          if (!provider) {
            setSdkError("Failed to get wallet provider");
            return;
          }

          // Get initial accounts
          const accounts = await provider.request({ method: "eth_accounts" });
          if (accounts && accounts[0]) {
            const address = accounts[0].toLowerCase() as `0x${string}`;
            setWalletAddress(address);
            setIsWalletConnected(true);
          }

          await sdk.actions.ready();
        } catch (error: unknown) {
          console.error("Farcaster SDK Error:", error);
          return;
        }
      } catch (error) {
        console.error("SDK initialization error:", error);
        setSdkError("Failed to initialize. Please try again.");
      }
    };

    if (!isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  // Fetch balances function
  const fetchBalances = useCallback(async () => {
    if (isBalanceLoading) {
      return;
    }

    if (!walletAddress) {
      const defaultTokens = SUPPORTED_VAULTS.map((token) => ({
        ...token,
        balance: "0",
        balanceUSD: "0",
        price: "0",
      })) as TokenInfo[];

      setTokenBalances(defaultTokens);
      setVaultBalances({});
      setSupportedTokens(defaultTokens);
      return;
    }

    try {
      setIsBalanceLoading(true);

      // Only fetch balances, not base tokens (that's handled separately)
      const balances = await getPortalsBalances(walletAddress, chainId);

      const defaultTokens = SUPPORTED_VAULTS.map((token) => ({
        ...token,
        balance: "0",
        balanceUSD: "0",
        price: "0",
      })) as TokenInfo[];

      // Process all balances
      const newVaultBalances: { [key: string]: TokenInfo | null } = {};
      const tokensWithBalance: TokenInfo[] = [];

      if (balances && balances.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        balances.forEach((balance: any) => {
          const tokenAddress = balance.address?.toLowerCase();
          const matchingVault = SUPPORTED_VAULTS.find(
            (vault) => vault.vaultAddress?.toLowerCase() === tokenAddress,
          );

          if (matchingVault) {
            // This is a vault token
            const price = new BigNumber(balance.balanceUSD)
              .div(new BigNumber(balance.balance))
              .toString();

            newVaultBalances[matchingVault.symbol] = {
              symbol: normalizeTokenSymbol(balance.symbol),
              name: balance.name,
              id: `${normalizeTokenSymbol(balance.symbol).toLowerCase()}_${chainId}`,
              icon: balance.image || balance.images?.[0] || FALLBACK_TOKEN_ICON,
              address: balance.address as `0x${string}`,
              decimals: balance.decimals,
              balance: balance.balance.toString(),
              balanceUSD: balance.balanceUSD.toString(),
              price: balance.price ?? price,
            };
          } else if (Number(balance.balanceUSD) > 0) {
            // This is a regular token with positive balance
            const price = new BigNumber(balance.balanceUSD)
              .div(new BigNumber(balance.balance))
              .toString();

            tokensWithBalance.push({
              symbol: normalizeTokenSymbol(balance.symbol),
              name: balance.name,
              id: `${normalizeTokenSymbol(balance.symbol).toLowerCase()}_${chainId}`,
              icon: balance.image || balance.images?.[0] || FALLBACK_TOKEN_ICON,
              address: balance.address as `0x${string}`,
              decimals: balance.decimals,
              balance: balance.balance.toString(),
              balanceUSD: balance.balanceUSD.toString(),
              price: balance.price ?? price,
            });
          }
        });

        // Set null for vaults without balances
        SUPPORTED_VAULTS.forEach((vault) => {
          if (!newVaultBalances[vault.symbol]) {
            newVaultBalances[vault.symbol] = null;
          }
        });

        setVaultBalances(newVaultBalances);
        setTokenBalances(tokensWithBalance);
      } else {
        setVaultBalances({});
        setTokenBalances(defaultTokens);
      }
    } catch (error) {
      console.error("Failed to fetch balances:", error);

      const defaultTokens = SUPPORTED_VAULTS.map((token) => ({
        ...token,
        balance: "0",
        balanceUSD: "0",
        price: "0",
      })) as TokenInfo[];

      setTokenBalances(defaultTokens);
      setVaultBalances({});
      setSupportedTokens(defaultTokens);
    } finally {
      setIsBalanceLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, chainId, getPortalsBalances]);

  // Fetch balances when critical dependencies change
  useEffect(() => {
    if (walletAddress && chainId) {
      fetchBalances();
    }
  }, [walletAddress, chainId, fetchBalances]);

  const openTokenModal = () => {
    if (mode === "convert") {
      setIsConvertTokenModalOpen(true);
    } else {
      setIsRevertTokenModalOpen(true);
    }
  };

  // Fetch supported tokens when wallet is connected and chainId is available
  useEffect(() => {
    const fetchSupportedTokens = async () => {
      if (!chainId || !walletAddress) return; // Only fetch when wallet is connected

      try {
        const tokens = await getPortalsBaseTokens(chainId);
        if (tokens) {
          // Get balances since address is available
          const balances =
            (await getPortalsBalances(walletAddress, chainId)) || [];

          const tokenInfos = tokens.map((token: Token) => {
            // Find matching balance info
            const balanceInfo = balances.find(
              (b) => b.address?.toLowerCase() === token.address?.toLowerCase(),
            );

            return {
              symbol: normalizeTokenSymbol(token.symbol),
              name: token.name,
              id: `${normalizeTokenSymbol(token.symbol).toLowerCase()}_${chainId}`,
              icon: token.image || token.images?.[0] || FALLBACK_TOKEN_ICON,
              address: token.address as `0x${string}`,
              decimals: token.decimals,
              balance: balanceInfo ? balanceInfo.balance.toString() : "0",
              balanceUSD: balanceInfo ? balanceInfo.balanceUSD.toString() : "0",
              price: balanceInfo
                ? new BigNumber(balanceInfo.balanceUSD)
                    .div(new BigNumber(balanceInfo.balance))
                    .toString()
                : "0",
              images: token.images,
            };
          });
          setSupportedTokens(tokenInfos);
        }
      } catch (error) {
        console.error("Failed to fetch supported tokens:", error);
      }
    };

    fetchSupportedTokens();
  }, [chainId, walletAddress, getPortalsBaseTokens, getPortalsBalances]);

  // Update the success handlers
  const handleConvertSuccess = async () => {
    setIsConvertModalOpen(false);
    setDepositAmount("0");
    await fetchBalances();

    if (!walletAddress) return;

    const updatedBalances = await getPortalsBalances(walletAddress, chainId);
    if (updatedBalances) {
      const currentToken = updatedBalances.find(
        (b) =>
          b.address &&
          selectedToken.address &&
          b.address.toLowerCase() === selectedToken.address.toLowerCase(),
      );

      if (!currentToken || Number(currentToken.balanceUSD) <= 0) {
        const nextToken = updatedBalances.find(
          (b) =>
            b.address &&
            Number(b.balanceUSD) > 0 &&
            b.address.toLowerCase() !== vaultAddress?.toLowerCase(),
        );

        if (nextToken) {
          setSelectedToken({
            symbol: nextToken.symbol,
            name: nextToken.name,
            id: `${nextToken.symbol.toLowerCase()}_${chainId}`,
            icon:
              nextToken.image || nextToken.images?.[0] || FALLBACK_TOKEN_ICON,
            address: nextToken.address as `0x${string}`,
            decimals: nextToken.decimals,
            balance: nextToken.balance.toString(),
            balanceUSD: nextToken.balanceUSD.toString(),
            price: new BigNumber(nextToken.balanceUSD)
              .div(new BigNumber(nextToken.balance))
              .toString(),
            images: nextToken.images,
          });
        }
      } else if (Number(currentToken.balanceUSD) > 0) {
        setSelectedToken({
          symbol: currentToken.symbol,
          name: currentToken.name,
          id: `${currentToken.symbol.toLowerCase()}_${chainId}`,
          icon:
            currentToken.image ||
            currentToken.images?.[0] ||
            FALLBACK_TOKEN_ICON,
          address: currentToken.address as `0x${string}`,
          decimals: currentToken.decimals,
          balance: currentToken.balance.toString(),
          balanceUSD: currentToken.balanceUSD.toString(),
          price: new BigNumber(currentToken.balanceUSD)
            .div(new BigNumber(currentToken.balance))
            .toString(),
          images: currentToken.images,
        });
      }
    }
  };

  const handleRevertSuccess = async () => {
    setIsRevertModalOpen(false);
    setDepositAmount("0");
    setVaultBalances({});
    await fetchBalances();

    if (!walletAddress) return;

    const updatedBalances = await getPortalsBalances(walletAddress, chainId);
    if (updatedBalances) {
      const currentVaultToken = updatedBalances.find(
        (b) =>
          b.address &&
          vaultAddress &&
          b.address.toLowerCase() === vaultAddress.toLowerCase(),
      );

      if (!currentVaultToken || Number(currentVaultToken.balanceUSD) <= 0) {
        setSelectedToken({
          symbol: "USDC",
          name: "USD Coin",
          id: "IPOR_USDC_base",
          icon: "/images/tokens/usdc.svg",
          address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
          decimals: 6,
          balance: "0",
          balanceUSD: "0",
          price: "0",
          images: ["/images/tokens/usdc.svg"],
        });
      }
    }
  };

  // Add token symbol normalization
  const normalizeTokenSymbol = (symbol: string) => {
    const symbolMap: { [key: string]: string } = {
      CBBTC: "cbBTC",
    };
    return symbolMap[symbol] || symbol;
  };

  // Switch to Base chain if needed
  useEffect(() => {
    const switchToBase = async () => {
      if (chainId !== base.id && isWalletConnected) {
        try {
          const provider = await sdk.wallet.getEthereumProvider();
          if (provider) {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${base.id.toString(16)}` }],
            });
          }
        } catch (error) {
          console.error("Failed to switch to Base:", error);
        }
      }
    };
    switchToBase();
  }, [chainId, isWalletConnected]);

  // Early return for SDK errors with custom UI
  if (sdkError) {
    return (
      <div className="w-[300px] mx-auto pt-16 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">
          Harvest on Autopilot 🌾
        </h1>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            {sdkError}
          </p>
          {sdkError.includes("reconnect") && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reconnect
              </Button>
            </div>
          )}
          {sdkError.includes("Warpcast") && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  window.location.href =
                    "https://farcaster.xyz/~/developers/mini-apps/manifest";
                }}
              >
                Open in Warpcast
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (!isSDKLoaded) {
    return (
      <div className="w-[300px] mx-auto pt-16 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">
          Harvest on Autopilot 🌾
        </h1>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
          <div className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Not connected state with custom UI
  if (!isWalletConnected) {
    return (
      <div className="w-[300px] mx-auto pt-16 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">
          Harvest on Autopilot 🌾
        </h1>
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your positions
          </p>
          <Button
            onClick={async () => {
              try {
                const provider = await sdk.wallet.getEthereumProvider();
                if (provider) {
                  const accounts = await provider.request({
                    method: "eth_requestAccounts",
                  });
                  if (accounts && accounts[0]) {
                    setWalletAddress(accounts[0] as `0x${string}`);
                    setIsWalletConnected(true);
                  }
                }
              } catch (error) {
                console.error("Failed to connect wallet:", error);
              }
            }}
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg mx-auto px-2 py-3">
          <h1 className="text-2xl font-bold text-center mb-6">
            Harvest on Autopilot 🌾
          </h1>

          {/* Notification */}
          {notification && (
            <div
              className={`mb-4 p-4 rounded-lg border ${
                notification.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="text-sm">{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="text-current hover:opacity-70 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Token Selection */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              {SUPPORTED_VAULTS.map((vault) => (
                <VaultCard
                  key={vault.symbol}
                  vault={vault}
                  isSelected={selectedVault === vault.symbol}
                  onSelect={() => {
                    setSelectedVault(vault.symbol);
                    setVaultAddress(vault.vaultAddress as `0x${string}`);
                    const token = tokenBalances.find(
                      (t) => t.symbol === vault.symbol,
                    );
                    if (token) {
                      setSelectedToken(token);
                    } else {
                      setSelectedToken({
                        symbol: vault.symbol,
                        name: vault.name,
                        id: vault.id,
                        icon: vault.icon,
                        address: vault.address,
                        decimals: vault.decimals,
                        balance: "0",
                        balanceUSD: "0",
                        price: "0",
                        images: vault.images,
                      });
                    }
                    setDepositAmount("0");
                  }}
                />
              ))}
            </div>
          </div>

          {/* User Balance */}
          {isWalletConnected && selectedVault && (
            <UserBalances
              vault={SUPPORTED_VAULTS.find((v) => v.symbol === selectedVault)!}
              balance={getVaultBalance(selectedVault)}
            />
          )}

          {/* Mode Selection */}
          <div className="flex justify-center gap-3 mb-4 mt-4">
            <Button
              onClick={() => setMode("convert")}
              className={`px-4 py-2 text-sm ${mode === "convert" ? "bg-purple-700" : "bg-gray-500"}`}
            >
              Convert
            </Button>
            <Button
              onClick={() => setMode("revert")}
              className={`px-4 py-2 text-sm ${mode === "revert" ? "bg-purple-700" : "bg-gray-500"}`}
            >
              Revert
            </Button>
          </div>

          {/* Main Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Amount to {mode}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={depositAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(",", ".");
                    if (!isNaN(Number(value)) && Number(value) >= 0) {
                      setDepositAmount(value);
                    }
                  }}
                  placeholder="0.0"
                  className="w-full p-3 pr-24 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-base"
                />
                <button
                  onClick={openTokenModal}
                  className="absolute right-2 flex items-center gap-2 px-2 py-1.5 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  {selectedToken ? (
                    <>
                      <img
                        src={selectedToken.icon}
                        alt={selectedToken.symbol}
                        className="w-5 h-5"
                      />
                      <span className="font-medium">
                        {selectedToken.symbol}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">Select</span>
                  )}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-1 text-sm">
                {mode === "convert" ? (
                  selectedToken ? (
                    <button
                      onClick={() => {
                        // Ensure the balance is properly formatted as a decimal string
                        const balance = new BigNumber(
                          selectedToken.balance || "0",
                        ).toString();
                        setDepositAmount(balance);
                      }}
                      className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
                    >
                      Balance:{" "}
                      {isBalanceLoading ? (
                        <span className="inline-block w-12 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
                      ) : (
                        <>
                          {formatBalance(selectedToken.balance)}{" "}
                          {selectedToken.symbol}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-gray-500">Balance:</div>
                  )
                ) : getVaultBalance(selectedVault) ? (
                  <button
                    onClick={() => {
                      const vaultBalance = getVaultBalance(selectedVault);
                      // Ensure the balance is properly formatted as a decimal string
                      if (vaultBalance) {
                        const balance = new BigNumber(
                          vaultBalance.balance || "0",
                        ).toString();
                        setDepositAmount(balance);
                      }
                    }}
                    className="text-gray-500 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    Balance:{" "}
                    {isBalanceLoading ? (
                      <span className="inline-block w-12 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
                    ) : (
                      <>
                        {formatBalance(
                          getVaultBalance(selectedVault)?.balance || "0",
                        )}{" "}
                        {SUPPORTED_VAULTS.find(
                          (v) => v.symbol === selectedVault,
                        )?.vaultSymbol || selectedVault}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-gray-500">
                    Balance:{" "}
                    {isBalanceLoading ? (
                      <span className="inline-block w-12 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></span>
                    ) : (
                      <>
                        0{" "}
                        {SUPPORTED_VAULTS.find(
                          (v) => v.symbol === selectedVault,
                        )?.vaultSymbol || selectedVault}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={async () => {
                if (!isWalletConnected) {
                  try {
                    const provider = await sdk.wallet.getEthereumProvider();
                    if (provider) {
                      const accounts = await provider.request({
                        method: "eth_requestAccounts",
                      });
                      if (accounts && accounts[0]) {
                        setWalletAddress(accounts[0] as `0x${string}`);
                        setIsWalletConnected(true);
                      }
                    }
                  } catch (error) {
                    console.error("Failed to connect wallet:", error);
                  }
                  return;
                }

                // Validate balance before opening modal
                const inputAmount = new BigNumber(depositAmount);

                if (mode === "convert") {
                  if (!selectedToken) {
                    showNotification("Please select a token to convert");
                    return;
                  }

                  const availableBalance = new BigNumber(selectedToken.balance);
                  if (inputAmount.gt(availableBalance)) {
                    showNotification(
                      `Insufficient ${selectedToken.symbol} balance. Available: ${formatBalance(selectedToken.balance)} ${selectedToken.symbol}`,
                    );
                    return;
                  }

                  setIsConvertModalOpen(true);
                } else {
                  const vaultBalance = getVaultBalance(selectedVault);
                  if (!vaultBalance) {
                    showNotification("No vault balance available to revert");
                    return;
                  }

                  const availableBalance = new BigNumber(vaultBalance.balance);
                  if (inputAmount.gt(availableBalance)) {
                    const vaultSymbol =
                      SUPPORTED_VAULTS.find((v) => v.symbol === selectedVault)
                        ?.vaultSymbol || selectedVault;
                    showNotification(
                      `Insufficient ${vaultSymbol} balance. Available: ${formatBalance(vaultBalance.balance)} ${vaultSymbol}`,
                    );
                    return;
                  }

                  setIsRevertModalOpen(true);
                }
              }}
              disabled={
                !(Number(depositAmount) > 0) || !selectedToken || !vaultAddress
              }
              className="w-full"
            >
              {!isWalletConnected
                ? "Connect Wallet"
                : `Preview & ${mode === "convert" ? "Convert" : "Revert"}`}
            </Button>
          </div>
        </div>
      </div>

      {isConvertTokenModalOpen && (
        <ConvertTokenSelectModal
          isOpen={isConvertTokenModalOpen}
          onClose={() => setIsConvertTokenModalOpen(false)}
          onSelect={(token: TokenInfo) => {
            setSelectedToken(token);
            setIsConvertTokenModalOpen(false);
            setDepositAmount("0");
          }}
          selectedToken={tokenBalances.find(
            (t) => t.symbol === selectedToken.symbol,
          )}
          tokens={[
            ...tokenBalances,
            // Add vault tokens to the list
            ...Object.entries(vaultBalances)
              .filter(
                ([symbol, vaultToken]) =>
                  symbol !== selectedVault &&
                  vaultToken !== null &&
                  Number(vaultToken.balance) > 0,
              )
              .map(([_, vaultToken]) => vaultToken as TokenInfo),
          ].sort((a, b) => Number(b.balanceUSD) - Number(a.balanceUSD))}
        />
      )}

      {isRevertTokenModalOpen && (
        <RevertTokenSelectModal
          isOpen={isRevertTokenModalOpen}
          onClose={() => setIsRevertTokenModalOpen(false)}
          onSelect={(token: TokenInfo) => {
            setSelectedToken(token);
            setIsRevertTokenModalOpen(false);
            setDepositAmount("0");
          }}
          selectedToken={selectedToken}
          tokens={[
            ...supportedTokens.filter((token) => {
              if (!token.address || !vaultAddress) return false;
              const currentVault = SUPPORTED_VAULTS.find(
                (v) => v.symbol === selectedVault,
              );
              if (!currentVault) return false;
              const supportedAddresses = Object.values(
                SUPPORTED_TOKEN_LIST[
                  chainId as keyof typeof SUPPORTED_TOKEN_LIST
                ] || {},
              ).map((addr) => addr.toLowerCase());
              const isBaseToken =
                token.address.toLowerCase() ===
                currentVault.address.toLowerCase();
              const isInSupportedList = supportedAddresses.includes(
                token.address.toLowerCase(),
              );
              return isBaseToken || isInSupportedList;
            }),
            // Add vault tokens to the list
            ...Object.entries(vaultBalances)
              .filter(
                ([symbol, vaultToken]) =>
                  symbol !== selectedVault &&
                  vaultToken !== null &&
                  Number(vaultToken.balance) > 0,
              )
              .map(([_, vaultToken]) => vaultToken as TokenInfo),
          ].sort((a, b) => Number(b.balanceUSD) - Number(a.balanceUSD))}
        />
      )}

      {mode === "convert" ? (
        <ConvertModal
          chainId={chainId}
          isOpen={isConvertModalOpen}
          onClose={() => {
            setIsConvertModalOpen(false);
          }}
          fid={fid}
          selectedToken={selectedToken}
          depositAmount={depositAmount}
          vaultAddress={vaultAddress}
          onSuccess={handleConvertSuccess}
          walletAddress={walletAddress}
          handleWalletInteraction={handleWalletInteraction}
        />
      ) : (
        <RevertModal
          chainId={chainId}
          isOpen={isRevertModalOpen}
          onClose={() => {
            setIsRevertModalOpen(false);
          }}
          fid={fid}
          selectedToken={selectedToken}
          withdrawAmount={depositAmount}
          selectedVault={
            SUPPORTED_VAULTS.find(
              (v) => v.symbol === selectedVault,
            ) as VaultInfo
          }
          onSuccess={handleRevertSuccess}
          walletAddress={walletAddress}
          handleWalletInteraction={handleWalletInteraction}
        />
      )}
    </>
  );
}
