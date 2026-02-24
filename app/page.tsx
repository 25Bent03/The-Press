"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const router = useRouter();
  const { connected, disconnect, publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [tokenMint, setTokenMint] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [duration, setDuration] = useState("24");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState("");

  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [displayedModalText, setDisplayedModalText] = useState("");
  const modalFullText = "Please connect your wallet to create tasks and interact with the platform. Without a connected wallet, you won't be able to create tasks or lock tokens in escrow.";

  const [displayedPageText, setDisplayedPageText] = useState("");
  const pageFullText = "Create your first task and lock tokens in escrow, or check out our Guide to get started!";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected) {
      setShowWelcomeModal(false);
    }
  }, [connected]);

  useEffect(() => {
    if (showWelcomeModal && !connected) {
      let index = 0;
      setDisplayedModalText("");
      const timer = setInterval(() => {
        if (index < modalFullText.length) {
          setDisplayedModalText(modalFullText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 20);

      return () => clearInterval(timer);
    }
  }, [showWelcomeModal, connected]);

  useEffect(() => {
    if (!showWelcomeModal) {
      let index = 0;
      setDisplayedPageText("");
      const timer = setInterval(() => {
        if (index < pageFullText.length) {
          setDisplayedPageText(pageFullText.substring(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [showWelcomeModal]);

  const handleCreateTask = async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet!");
      return;
    }

    if (!taskTitle || !tokenMint || !tokenAmount) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      setIsLoading(true);

      // MAINNET CONNECTION
      const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
      const escrowPublicKey = new PublicKey(process.env.NEXT_PUBLIC_ESCROW_PUBLIC_KEY!);
      const mintPubkey = new PublicKey(tokenMint.trim());

      const senderTokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
      const escrowTokenAccount = await getAssociatedTokenAddress(mintPubkey, escrowPublicKey);

      const amountInSmallestUnits = Math.floor(parseFloat(tokenAmount) * 1e6);

      console.log("Creating Transaction...");
      console.log("From:", senderTokenAccount.toBase58());
      console.log("To:", escrowTokenAccount.toBase58());
      console.log("Amount:", amountInSmallestUnits);

      const transaction = new Transaction();

      const escrowAccountInfo = await connection.getAccountInfo(escrowTokenAccount);

      if (!escrowAccountInfo) {
        console.log("Escrow token account doesn't exist - creating it...");
        
        const createAccountIx = createAssociatedTokenAccountInstruction(
          publicKey,
          escrowTokenAccount,
          escrowPublicKey,
          mintPubkey
        );
        
        transaction.add(createAccountIx);
      } else {
        console.log("Escrow token account already exists");
      }

      const transferInstruction = createTransferInstruction(
        senderTokenAccount,
        escrowTokenAccount,
        publicKey,
        amountInSmallestUnits
      );

      transaction.add(transferInstruction);

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      console.log("Transaction sent:", signature);

      await connection.confirmTransaction(signature, "confirmed");

      console.log("Transaction confirmed!");

      const deadline = new Date();
      deadline.setHours(deadline.getHours() + parseInt(duration));

      const { data, error } = await supabase.from("tasks").insert([
        {
          creator_wallet: publicKey.toBase58(),
          token_mint: tokenMint.trim(),
          token_symbol: tokenSymbol.trim() || null,
          token_amount: amountInSmallestUnits,
          task_title: taskTitle,
          task_description: taskDescription,
          submission_link: submissionLink,
          deadline: deadline.toISOString(),
          status: "active",
          escrow_signature: signature,
        },
      ]).select();

      if (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to save task to database");
      }

      console.log("Task saved to database:", data);

      setTransactionSignature(signature);
      setShowSuccessModal(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 5000);

    } catch (error: any) {
      console.error("Error:", error);
      alert("ERROR: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = connected
    ? "absolute top-20 right-4 md:top-24 md:right-8 inline-flex items-center gap-2 border-2 border-black px-4 py-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-50 hover:border-red-500 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
    : "absolute top-20 right-4 md:top-24 md:right-8 inline-flex items-center gap-2 border-2 border-black px-4 py-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";

  const dotClass = connected
    ? "w-3 h-3 border border-black rounded-full bg-green-500 animate-pulse"
    : "w-3 h-3 border border-black rounded-full bg-red-500";

  const formClass = connected
    ? "space-y-6 transition-opacity opacity-100"
    : "space-y-6 transition-opacity opacity-50 pointer-events-none";

  const renderPageText = () => {
    const parts = displayedPageText.split("Guide");
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}
          <a href="/guide" className="text-[#3C5A99] underline font-bold">Guide</a>
          {parts[1]}
        </>
      );
    }
    return displayedPageText;
  };

  return (
    <main className="min-h-screen bg-gray-50 text-black font-sans p-8 md:p-12 flex flex-col items-center justify-center relative">
      <button onClick={connected ? disconnect : () => setVisible(true)} className={buttonClass}>
        <div className={dotClass}></div>
        <span className="text-xs md:text-sm font-bold tracking-widest uppercase">
          {connected ? "CONNECTED" : "CONNECT WALLET"}
        </span>
      </button>

      <div className="max-w-4xl mx-auto mb-12 text-center space-y-4 w-full">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none text-black">THE PRESS</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xl font-bold uppercase tracking-widest mt-2">
          <span className="bg-[#3C5A99] text-white px-2 py-1">Proof of Shill</span>
          <span className="hidden md:inline text-gray-600">//</span>
          <span className="text-gray-500">Work for Coins</span>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center lg:justify-end relative order-2 lg:order-1">
          <div className="relative w-full max-w-lg aspect-square filter grayscale contrast-125 mt-16">
            <Image src="/mascot.png" alt="Mascot" width={800} height={800} className="object-contain w-full h-full rounded-lg" priority />
            
            {!showWelcomeModal && (
              <div className="absolute top-0 left-0 transform -translate-x-4 -translate-y-12 w-[400px]">
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-xl relative">
                  <p className="text-base text-gray-700 leading-relaxed min-h-[80px]">
                    {renderPageText()}
                    <span className="animate-pulse">|</span>
                  </p>
                  <div className="absolute -bottom-4 left-12 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-black"></div>
                  <div className="absolute -bottom-[13px] left-[50px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[18px] border-t-white"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-start w-full order-1 lg:order-2">
          <div className="w-full max-w-xl bg-white bg-opacity-40 backdrop-blur-md border-2 border-gray-300 rounded-lg p-8 md:p-10 relative shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-gray-200 pb-2 text-black">Create Task</h2>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className={formClass}>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Task Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Best Tweet About Our Token" 
                    value={taskTitle} 
                    onChange={(e) => setTaskTitle(e.target.value)} 
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Task Description</label>
                  <textarea 
                    placeholder="Describe what holders need to do..." 
                    value={taskDescription} 
                    onChange={(e) => setTaskDescription(e.target.value)} 
                    rows={3}
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Token Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://pump.fun/your-token or https://bonk.com" 
                    value={submissionLink} 
                    onChange={(e) => setSubmissionLink(e.target.value)} 
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">Link to your token on Pump.fun, DEX, or project website</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Token Mint Address *</label>
                  <input 
                    type="text" 
                    placeholder="Token mint address..." 
                    value={tokenMint} 
                    onChange={(e) => setTokenMint(e.target.value)} 
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Token Symbol (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SOL, USDC, BONK..." 
                    value={tokenSymbol} 
                    onChange={(e) => setTokenSymbol(e.target.value)} 
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400 uppercase"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">Optional: Enter token ticker for better display</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Reward Amount *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 100000" 
                    value={tokenAmount} 
                    onChange={(e) => setTokenAmount(e.target.value)} 
                    className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">Duration (Hours)</label>
                  <div className="relative">
                    <select 
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      className="w-full bg-white bg-opacity-50 border-2 border-gray-300 p-3 pr-10 focus:outline-none focus:border-[#3C5A99] rounded text-black uppercase appearance-none cursor-pointer"
                    >
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours</option>
                      <option value="48">48 Hours</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {mounted && !connected ? (
                  <div className="w-full bg-gray-100 text-gray-500 p-4 text-center border-2 border-dashed border-gray-300 uppercase font-bold text-sm rounded">
                    Connect wallet to create task
                  </div>
                ) : (
                  <button 
                    onClick={handleCreateTask} 
                    disabled={isLoading} 
                    className="w-full bg-[#3C5A99] text-white py-4 text-lg font-bold tracking-wider uppercase transition-all hover:bg-[#4C6AA9] disabled:opacity-50 disabled:cursor-not-allowed rounded"
                  >
                    {isLoading ? "CREATING TASK..." : "CREATE TASK & LOCK TOKENS"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {showWelcomeModal && !connected && mounted && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <div className="relative bg-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-5xl font-black text-black mb-4">
                  Welcome to The Press!
                </h2>
              </div>
              
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed text-center min-h-[120px]">
                {displayedModalText}
                <span className="animate-pulse">|</span>
              </p>

              <p className="text-base text-gray-600 mb-8 text-center">
                New here? Check out our <a href="/guide" className="text-[#3C5A99] underline font-bold">Guide</a> to get started!
              </p>

              <button
                onClick={() => setVisible(true)}
                className="w-full bg-[#3C5A99] text-white py-4 px-8 text-xl font-black uppercase rounded-lg hover:bg-[#4C6AA9] transition-all shadow-lg mb-3"
              >
                Connect Wallet
              </button>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-white text-gray-700 border-2 border-gray-300 py-3 px-8 text-lg font-bold uppercase rounded-lg hover:bg-gray-50 transition-all"
              >
                Browse Without Wallet
              </button>

              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[30px] border-t-black"></div>
              <div className="absolute -bottom-[26px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[26px] border-t-white"></div>
            </div>

            <div className="w-[500px] h-[500px] filter grayscale contrast-125 -mt-16">
              <Image src="/mascot.png" alt="Mascot" width={800} height={800} className="object-contain w-full h-full" />
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-10 max-w-md w-full shadow-lg text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-black text-black mb-3">Task Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Your tokens have been locked in escrow.</p>
            
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-xs font-bold text-gray-600 mb-2">TRANSACTION</p>
              <a 
                href={`https://solscan.io/tx/${transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs break-all text-[#3C5A99] hover:underline block"
              >
                {transactionSignature}
              </a>
              <p className="text-xs text-gray-500 mt-2">Click to view on Solscan</p>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Redirecting to dashboard...</p>
            
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard");
              }}
              className="w-full bg-[#3C5A99] text-white py-3 font-bold uppercase rounded"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      )}
    </main>
  );
}