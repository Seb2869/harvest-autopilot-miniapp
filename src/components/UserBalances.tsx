import { UserBalancesProps } from "~/types";
import { formatBalance } from "~/utilities/parsers";

export default function UserBalances({ vault, balance }: UserBalancesProps) {
  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium mb-4">Your Balance</h3>
      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <img src={vault.icon} alt={vault.symbol} className="w-6 h-6" />
          <span className="font-medium">{vault.vaultSymbol}</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-green-500 dark:text-green-400">
            {formatBalance(balance?.balance || "0")}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ${formatBalance(balance?.balanceUSD || "0")}
          </div>
        </div>
      </div>
    </div>
  );
}
