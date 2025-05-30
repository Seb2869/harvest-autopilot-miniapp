/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://wallet.farcaster.xyz",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' 
                https://farcaster.xyz 
                https://client.farcaster.xyz 
                https://warpcast.com 
                https://client.warpcast.com 
                https://wrpcd.net 
                https://*.wrpcd.net 
                https://privy.farcaster.xyz 
                https://privy.warpcast.com 
                https://auth.privy.io 
                https://*.rpc.privy.systems 
                https://cloudflareinsights.com 
                https://explorer-api.walletconnect.com/* 
                https://*.walletconnect.com/* 
                https://*.walletconnect.org/* 
                https://*.base.org 
                https://mainnet.base.org 
                https://1rpc.io 
                wss://*.base.org 
                ws://*.base.org 
                http://*.base.org 
                https://*.base.org 
                https://relay.walletconnect.com/* 
                https://registry.walletconnect.com/* 
                https://verify.walletconnect.com/* 
                https://api.walletconnect.com/* 
                wss://*.walletconnect.com/* 
                https://api.portals.fi 
                https://*.portals.fi
                https://api.harvest.finance/*
                https://*.harvest.finance/*
                https://wallet.farcaster.xyz/*
                https://*.farcaster.xyz/*
                https://*.warpcast.com/*
                https://base-mainnet.g.alchemy.com/*
                https://*.alchemy.com/*;
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://wallet.farcaster.xyz https://client.warpcast.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              font-src 'self' data:;
              frame-src 'self' https://wallet.farcaster.xyz https://*.walletconnect.com https://*.warpcast.com;
              worker-src 'self' blob:;
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
