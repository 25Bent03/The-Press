import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, winnerWallet } = body;

    if (!taskId || !winnerWallet) {
      return NextResponse.json(
        { error: "Missing taskId or winnerWallet" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (winnerWallet.length < 32 || winnerWallet.length > 44) {
      return NextResponse.json(
        { error: "Invalid Solana wallet address" },
        { status: 400 }
      );
    }

    // Get the task
    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (fetchError || !task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if task is in the right status
    const now = new Date();
    const deadline = new Date(task.deadline);
    const sixHoursBeforeDeadline = new Date(deadline.getTime() - 6 * 60 * 60 * 1000);

    if (now < sixHoursBeforeDeadline) {
      return NextResponse.json(
        { error: "Winner selection not available yet. Must be within 6 hours of deadline." },
        { status: 400 }
      );
    }

    if (task.status === "paid") {
      return NextResponse.json(
        { error: "Task already paid out" },
        { status: 400 }
      );
    }

    // Update task with winner
    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({ 
        winner_wallet: winnerWallet,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Winner selected successfully"
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
