import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      message: "Check app is running",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}