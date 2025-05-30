import { useVaultsData } from "~/hooks/useVaultsData";
import { VaultCardProps } from "~/types";
import { formatTVL } from "~/utilities/parsers";
import { useMemo } from "react";

export default function VaultCard({
  vault,
  isSelected,
  onSelect,
}: VaultCardProps) {
  const { vaultsData, loading, error } = useVaultsData();

  const data = useMemo(() => {
    return vault.id && vaultsData ? vaultsData[vault.id] : null;
  }, [vault.id, vaultsData]);

  return (
    <div className="flex flex-col">
      <button
        onClick={onSelect}
        className={`p-4 rounded-lg border transition-all ${
          isSelected
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-800"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <img src={vault.icon} alt={vault.symbol} className="w-8 h-8" />
          <span className="font-medium">{vault.symbol}</span>
        </div>
      </button>

      {/* Vault Statistics */}
      <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : error || !data ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            Failed to load stats
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                APY
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {parseFloat(data.estimatedApy).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                TVL
              </span>
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {formatTVL(data.totalValueLocked)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
