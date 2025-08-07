export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    config: {
      version: "0.0.1",
      name: "Harvest on Autopilot 🌾",
      icon: `${appUrl}/icon.png`,
      splashImage: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff",
      homeUrl: "https://miniapp.harvest.finance",
      fid: 1091383,
      key: "",
      signature: "",
    },
  };

  return Response.json(config);
}
