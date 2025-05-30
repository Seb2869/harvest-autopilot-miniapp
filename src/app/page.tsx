"use client";

import dynamic from "next/dynamic";
import { Providers } from "./providers";

const App = dynamic(() => import("~/components/App"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col pl-1 pr-1">
      <Providers>
        <App />
      </Providers>
    </main>
  );
}
