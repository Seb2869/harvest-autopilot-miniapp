export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    config: {
      name: "Yield Autopilot",
      version: "1",
      icon: `${appUrl}/icon.png`,
      splashImage: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7cf50",
      homeUrl: "https://miniapp.harvest.finance",
      fid: 1094840,
      key: "",
      signature: "",
    },
  };

  return Response.json(config);
}