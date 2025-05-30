import { NextResponse } from "next/server";
import axios from "axios";
import { HARVEST_API_URL } from "~/constants";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_HARVEST_API_KEY;
  if (!apiKey) {
    console.error("Missing HARVEST API key");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    console.log(
      "Fetching from:",
      `${HARVEST_API_URL}/vaults?key=${apiKey.slice(0, 4)}...`,
    );

    const response = await axios.get(`${HARVEST_API_URL}/vaults`, {
      params: { key: apiKey },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.data) {
      throw new Error("No data received from Harvest API");
    }

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Error fetching data from Harvest API",
        data: error,
      },
      { status: 500 },
    );
  }
}
