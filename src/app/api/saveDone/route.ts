import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { data, value }: { data: string; value: number } = await req.json();

    if (typeof value !== "number" || isNaN(value)) {
      return NextResponse.json({ error: "Invalid done value" }, { status: 400 });
    }

    const { error } = await supabase
      .from("done")
      .upsert({ date: data, done: value }, { onConflict: "date" });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Done counter updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: `Failed to update done counter: ${(error as Error).message}` }, { status: 500 });
  }
}
