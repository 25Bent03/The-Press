import { NextRequest, NextResponse } from "next/server";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";
import { supabase } from "@/lib/supabase";
import bs58 from "bs58";

export async function POST(request: NextRequest) {
  try {
    const now = new Date().toISOString();
    
    const { data: tasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "active")
      .not("winner_wallet", "is", null)
      .lte("deadline", now);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ 
        message: "No tasks ready for payout",
        processed: 0 
      });
    }

    // ✅ MAINNET
    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    
    const escrowPrivateKey = process.env.ESCROW_PRIVATE_KEY;
    if (!escrowPrivateKey) {
      return NextResponse.json({ error: "Escrow private key not configured" }, { status: 500 });
    }

    const escrowKeypair = Keypair.fromSecretKey(bs58.decode(escrowPrivateKey));
    
    const results = [];

    for (const task of tasks) {
      try {
        console.log(`Processing payout for task ${task.id}...`);

        const winnerPublicKey = new PublicKey(task.winner_wallet);
        const tokenMint = new PublicKey(task.token_mint);

        const escrowTokenAccount = await getAssociatedTokenAddress(tokenMint, escrowKeypair.publicKey);
        const winnerTokenAccount = await getAssociatedTokenAddress(tokenMint, winnerPublicKey);

        const transferIx = createTransferInstruction(
          escrowTokenAccount,
          winnerTokenAccount,
          escrowKeypair.publicKey,
          task.token_amount
        );

        const transaction = new Transaction().add(transferIx);
        transaction.feePayer = escrowKeypair.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        transaction.sign(escrowKeypair);
        const signature = await connection.sendRawTransaction(transaction.serialize());
        
        await connection.confirmTransaction(signature, "confirmed");

        await supabase
          .from("tasks")
          .update({ 
            status: "paid",
            updated_at: new Date().toISOString()
          })
          .eq("id", task.id);

        results.push({ taskId: task.id, success: true, signature });
        console.log(`✅ Task ${task.id} paid out: ${signature}`);

      } catch (error: any) {
        console.error(`❌ Error processing task ${task.id}:`, error);
        results.push({ taskId: task.id, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      message: "Payout processing complete",
      processed: tasks.length,
      results
    });

  } catch (error: any) {
    console.error("Payout API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
