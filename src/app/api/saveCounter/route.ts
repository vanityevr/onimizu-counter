import { supabase } from "@/lib/supabase"; // ✅ Import the separate module
import { NextResponse } from "next/server";

// POST request to update the counter value
export async function POST(req: Request) {
  try {
    const { counter } = await req.json();

    if (typeof counter !== 'number' || isNaN(counter)) {
      return NextResponse.json({ error: 'Invalid counter value' }, { status: 400 });
    }

    const { error } = await supabase
      .from('counters')
      .upsert({ id: 1, value: counter }, { onConflict: 'id' }); // Fix here, onConflict should be a single string

    if (error) {
      throw new Error(error.message); // Better error handling
    }

    return NextResponse.json({ message: 'Counter updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: `Failed to update counter: ${(error as Error).message}` }, { status: 500 });
  }
}
