import { TokenInfo } from "~/types";
import { formatBalance } from "~/utilities/parsers";
import { FALLBACK_TOKEN_ICON } from "~/constants";

interface TokenListProps {
  tokens: TokenInfo[];
  onSelect: (token: TokenInfo) => void;
  selectedToken?: TokenInfo;
}

export default function TokenList({
  tokens,
  onSelect,
  selectedToken,
}: TokenListProps) {
  return (
    <div className="space-y-2">
      {tokens.map((token) => (
        <button
          key={token.address}
          onClick={() => onSelect(token)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            selectedToken?.address === token.address
              ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <img
              src={token.icon || FALLBACK_TOKEN_ICON}
              alt={token.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = FALLBACK_TOKEN_ICON;
              }}
            />
            <div className="flex flex-col items-start">
              <span className="font-medium">{token.symbol}</span>
            </div>
          </div>
          {token.balance !== undefined && (
            <div className="flex flex-col items-end">
              <span className="font-medium">
                {formatBalance(token.balance)}
              </span>
              {token.balanceUSD !== undefined && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ${Number(token.balanceUSD).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
