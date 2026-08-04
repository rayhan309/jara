import { NextResponse } from "next/server";
import { getActiveClientReviews } from "@/lib/clientReviewsServer";

export async function GET() {
  try {
    const reviews = await getActiveClientReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}
