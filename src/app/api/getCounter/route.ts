import { supabase } from "@/lib/supabase"; // ✅ Import the separate module
import { NextResponse } from "next/server";

export async function GET() {  // ✅ No need for `req`
  try {
    console.log("Received GET request to /api/getCounter");

    const { data, error } = await supabase
      .from("counters")
      .select("value")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Supabase GET error:", error);
      throw new Error(error.message);
    }

    console.log("Supabase returned:", data);

    return NextResponse.json({ counter: data?.value || 0 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      { error: `Failed to fetch counter: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
