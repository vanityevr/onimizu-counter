import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (typeof key !== "string" || key.trim() === "") {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 }
      );
    }

    // Fetch all keys from the 'access' table
    const { data, error } = await supabase
      .from("access")
      .select("key");

    if (error) {
      throw new Error(error.message);
    }

    // Check if the provided key exists in the retrieved keys
    const isValid = data.some((entry) => entry.key === key);

    return NextResponse.json({ access: isValid });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to verify access: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
