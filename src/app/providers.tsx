"use client";

import { PropsWithChildren } from "react";
import { PortalsProvider } from "~/providers/Portals";
import WagmiAppProvider from "~/providers/Wagmi";

export function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiAppProvider>
      <PortalsProvider>{children}</PortalsProvider>
    </WagmiAppProvider>
  );
}
