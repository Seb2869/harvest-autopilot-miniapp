import { useState } from "react";
import TokenList from "./TokenList";
import type { TokenInfo } from "../../types";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenInfo) => void;
  selectedToken?: TokenInfo;
  tokens: TokenInfo[];
}

export default function TokenSelectModal({
  isOpen,
  onClose,
  onSelect,
  selectedToken,
  tokens,
}: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-4 shadow-xl ml-2 mr-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="token-select-title"
        aria-describedby="token-select-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="token-select-title" className="text-xl font-bold">
            Select Token to Withdraw To
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close token selection"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div id="token-select-description" className="sr-only">
          Select a token to withdraw your vault position to. You can withdraw to
          the original token or cbBTC.
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search vault token name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
            aria-label="Search vault tokens"
          />
        </div>

        {/* Token List */}
        <div className="max-h-96 overflow-y-auto">
          <TokenList
            tokens={filteredTokens}
            selectedToken={selectedToken}
            onSelect={(token: TokenInfo) => {
              onSelect(token);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
