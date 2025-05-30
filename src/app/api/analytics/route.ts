import { writeAnalyticsToSheet } from "~/googleSheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (
      !data.action ||
      !data.tokenSymbol ||
      !data.tokenAddress ||
      !data.amount ||
      !data.txHash
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: data,
          required: [
            "action",
            "tokenSymbol",
            "tokenAddress",
            "amount",
            "txHash",
          ],
        },
        { status: 400 },
      );
    }

    // Add timestamp if not provided
    const analyticsData = {
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    if (!spreadsheetId) {
      throw new Error("GOOGLE_SHEETS_ID environment variable not set");
    }

    await writeAnalyticsToSheet(spreadsheetId, analyticsData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to process analytics" },
      { status: 500 },
    );
  }
}
