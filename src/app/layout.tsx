import type { Metadata } from "next";

import "~/app/globals.css";
import { Providers } from "~/app/providers";

const BASE_URL = "harvest-autopilot.netlify.app";
const domain = BASE_URL ? `https://${BASE_URL}` : "http://localhost:3000";

const frame = {
  version: "next",
  imageUrl: `${domain}/harvest-thumbnail.png`,
  button: {
    title: "Deposit 🌾",
    action: {
      type: "launch_frame",
      name: "Harvest on Autopilot 🌾",
      url: domain,
      splashImageUrl: `${domain}/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "Harvest on Autopilot 🌾",
  description: "Harvest on Autopilot 🌾",
  openGraph: {
    title: "Harvest on Autopilot 🌾",
    description: "Harvest on Autopilot 🌾",
    images: [
      {
        url: `${domain}/harvest-thumbnail.png`,
        alt: "Harvest on Autopilot 🌾",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: `${domain}/favicon.svg`,
        type: "image/svg+xml",
      },
    ],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
