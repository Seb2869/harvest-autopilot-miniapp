# Harvest on Autopilot 🌾

A DeFi mini-app built for Farcaster Frames that enables users to easily convert their tokens into yield-bearing vault tokens and back. The app provides a seamless experience for managing DeFi positions with a focus on mobile responsiveness and accessibility.

## Features

- **Token Conversion**: Convert supported tokens into yield-bearing vault tokens
- **Token Reversion**: Withdraw from vaults back to original tokens
- **Real-time Estimates**: Get estimated output amounts before transactions
- **Mobile Responsive**: Fully optimized for mobile devices
- **Accessibility**: ARIA-compliant with proper labels and descriptions
- **Dark Mode Support**: Seamless experience in both light and dark modes
- **Transaction Tracking**: View and track your transaction status with links to block explorer
- **Native Farcaster Integration**: Seamless wallet connection through Farcaster Frame
- **View Vault Analytics**: Interactive charts to monitor vault performance
- **Monitor User Positions**: Track user balances and positions

## Supported Vaults

Currently supports the following vaults on Base:

- USDC Vault
- WETH Vault
- cbETH Vault

## Technical Stack

- **Framework**: Next.js
- **Blockchain Integration**: wagmi, viem
- **Wallet Connection**: Farcaster Frame SDK
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Price Data**: Portals API
- **CI**: GitHub Actions

## Key Features

### Token Management

- Smart token filtering based on vault selection
- Real-time balance updates
- Automatic price calculations
- Support for ERC20 tokens

### Transaction Handling

- Two-step transaction process (Approve & Convert/Withdraw)
- Real-time transaction status updates
- Error handling with user-friendly messages
- Transaction hash display with block explorer links

### User Experience

- Responsive design for all screen sizes
- Loading states and progress indicators
- Clear error messages with truncation for long errors
- Tooltips for additional information
- Mobile-optimized transaction displays

## Security Features

- Content Security Policy (CSP) compliance
- Secure wallet connections through Farcaster Frame
- Protected API endpoints
- Safe transaction handling
- Input validation and sanitization

## Accessibility

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

### Continuous Integration

The project uses GitHub Actions for continuous integration. The workflow includes:

- Code formatting check
- Linting
- Type checking
- Building
- Testing

The CI pipeline runs on:

- Every push to the master branch
- Every pull request to the master branch

To set up CI:

1. Fork the repository
2. Enable GitHub Actions in your repository settings
3. Push to the master branch or create a pull request to trigger the workflow

## Usage

1. Open the app in Farcaster Frame
2. Connect your wallet through Farcaster
3. Select a vault (USDC, WETH, or cbBTC)
4. Choose whether to convert tokens to vault tokens or withdraw from vault
5. Enter the amount you want to convert/withdraw
6. Approve token spending (if needed)
7. Confirm the transaction
8. Track transaction status and completion
