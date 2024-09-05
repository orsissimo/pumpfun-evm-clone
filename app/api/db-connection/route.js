import { NextResponse } from "next/server";
import { initMongoose } from "../mongodb/mongodb";

export async function GET() {
  try {
    await initMongoose();
    return NextResponse.json({ isConnected: true });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { isConnected: false, error: error.message },
      { status: 500 }
    );
  }
}
