import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Define the runtime
export const runtime = "nodejs";

// Handler for POST requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, variables } = body;

    if (!query) {
      return NextResponse.json(
        { error: "GraphQL query is required" },
        { status: 400 },
      );
    }
    // Make the GraphQL request to the external API
    const response = await axios.post(process.env.GRAPH_BASE_URL || "", {
      query,
      variables: variables || {},
    });

    // Return the data from the GraphQL API
    return NextResponse.json(response.data);
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
  ) {
    console.error("GraphQL proxy error:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Error querying GraphQL API",
        message: error.message,
        ...(error.response?.data ? { graphqlError: error.response.data } : {}),
      },
      { status: 500 },
    );
  }
}

// Add OPTIONS handler to support preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: "POST, OPTIONS",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  );
}
