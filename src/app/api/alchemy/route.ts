import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;
    const body = await request.json();

    const response = await fetch(
      `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Alchemy proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to Alchemy" },
      { status: 500 },
    );
  }
}

export const GET = POST; // Also handle GET requests the same way
