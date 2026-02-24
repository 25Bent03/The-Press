"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/lib/supabase";
import type { Task, TaskSubmission } from "@/lib/supabase";

export default function DashboardPage() {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskSubmissions, setTaskSubmissions] = useState<Record<string, TaskSubmission[]>>({});
  const [showingSubmissionsFor, setShowingSubmissionsFor] = useState<string | null>(null);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [winnerWallet, setWinnerWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      loadTasks();
    }
  }, [connected, publicKey]);

  const loadTasks = async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("creator_wallet", publicKey.toBase58())
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTasks(data || []);
      
      if (data && data.length > 0) {
        await loadAllSubmissions(data);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubmissions = async (tasks: Task[]) => {
    try {
      const submissions: Record<string, TaskSubmission[]> = {};
      for (const task of tasks) {
        const { data, error } = await supabase
          .from("task_submissions")
          .select("*")
          .eq("task_id", task.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          submissions[task.id] = data;
        }
      }
      setTaskSubmissions(submissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const getTaskStatus = (task: Task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const sixHoursBeforeDeadline = new Date(deadline.getTime() - 6 * 60 * 60 * 1000);

    if (task.status === "paid") return "paid";
    if (now >= deadline) return "ended";
    if (now >= sixHoursBeforeDeadline && !task.winner_wallet) return "ready_to_select";
    return "active";
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const shortenTxSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  const handleSelectWinner = async () => {
    if (!selectedTask || !winnerWallet) {
      alert("Please enter a winner wallet address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/select-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          winnerWallet: winnerWallet.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to select winner");
      }

      alert("Winner selected successfully! Tokens will be sent automatically when the deadline is reached.");
      setSelectedTask(null);
      setWinnerWallet("");
      loadTasks();
    } catch (error: any) {
      console.error("Error selecting winner:", error);
      alert("ERROR: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectApplicantAsWinner = (task: Task, applicantWallet: string) => {
    setSelectedTask(task);
    setWinnerWallet(applicantWallet);
  };

  const buttonClass = connected
    ? "absolute top-20 right-4 md:top-24 md:right-8 inline-flex items-center gap-2 border-2 border-black px-4 py-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-50 hover:border-red-500"
    : "absolute top-20 right-4 md:top-24 md:right-8 inline-flex items-center gap-2 border-2 border-black px-4 py-2 bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-white";

  const dotClass = connected
    ? "w-3 h-3 border border-black rounded-full bg-green-500 animate-pulse"
    : "w-3 h-3 border border-black rounded-full bg-red-500";

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <button onClick={connected ? disconnect : () => setVisible(true)} className={buttonClass} type="button">
        <div className={dotClass}></div>
        <span className="text-xs font-bold uppercase">{connected ? "CONNECTED" : "CONNECT WALLET"}</span>
      </button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black mb-8 border-b-2 pb-4 text-black">Creator Dashboard</h1>
        
        {!mounted || !connected ? (
          <div className="bg-white border-2 p-8 rounded-lg">
            <p className="text-xl font-bold text-black">Connect your wallet to view your tasks</p>
          </div>
        ) : loading ? (
          <div className="bg-white border-2 p-8 rounded-lg">
            <p className="text-xl font-bold text-black">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border-2 p-8 rounded-lg text-center">
            <p className="text-2xl font-bold mb-4 text-black">You have not created any tasks yet</p>
            <p className="text-gray-600 mb-6">Create your first task to see it appear here</p>
            <a href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-bold">
              Create Your First Task
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => {
              const status = getTaskStatus(task);
              const canSelectWinner = status === "ready_to_select";
              const hasWinner = !!task.winner_wallet;
              const submissions = taskSubmissions[task.id] || [];
              const showSubmissions = showingSubmissionsFor === task.id;

              return (
                <div key={task.id} className="bg-white border-2 rounded-lg p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-black">{task.task_title}</h2>
                      <p className="text-gray-600">{task.task_description}</p>
                    </div>
                    <div>
                      {status === "active" && <span className="bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded">Active</span>}
                      {status === "ready_to_select" && !hasWinner && <span className="bg-yellow-600 text-white px-3 py-1 text-xs font-bold rounded">Ready to Select</span>}
                      {status === "ready_to_select" && hasWinner && <span className="bg-orange-600 text-white px-3 py-1 text-xs font-bold rounded">Winner Selected</span>}
                      {status === "paid" && <span className="bg-green-600 text-white px-3 py-1 text-xs font-bold rounded">Paid Out</span>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-bold text-gray-600">Reward</p>
                      <p className="font-bold text-black">{(task.token_amount / 1e6).toLocaleString()} Tokens</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-600">Status</p>
                      <p className="font-bold text-black">{formatTimeRemaining(task.deadline)}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-600">Deadline</p>
                      <p className="font-bold text-black">{new Date(task.deadline).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-600">Applicants</p>
                      <p className="font-bold text-blue-600">{submissions.length} Applied</p>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  {task.escrow_signature && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                      <p className="font-bold text-xs text-gray-600 mb-2">ESCROW TRANSACTION</p>
                      <a 
                        href={`https://solscan.io/tx/${task.escrow_signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-[#3C5A99] hover:underline break-all block"
                      >
                        {shortenTxSignature(task.escrow_signature)}
                      </a>
                      <p className="text-xs text-gray-500 mt-1">Click to view on Solscan</p>
                    </div>
                  )}

                  {hasWinner && (
                    <div className="bg-green-50 border-2 border-green-500 rounded p-4 mb-4">
                      <p className="font-bold text-xs text-green-700 mb-2">WINNER SELECTED</p>
                      <p className="font-mono text-sm break-all text-black">{task.winner_wallet}</p>
                    </div>
                  )}

                  {submissions.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowingSubmissionsFor(showSubmissions ? null : task.id)}
                        className="w-full bg-gray-100 border-2 px-4 py-3 font-bold rounded flex items-center justify-between hover:bg-gray-200 text-black"
                      >
                        <span>View {submissions.length} Applicant{submissions.length !== 1 ? 's' : ''}</span>
                        <span className="text-2xl">{showSubmissions ? '−' : '+'}</span>
                      </button>

                      {showSubmissions && (
                        <div className="mt-4 space-y-3">
                          {submissions.map((submission) => (
                            <div key={submission.id} className="bg-gray-50 border-2 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-600 mb-1">TWITTER PROFILE</p>
                                  <a 
                                    href={submission.twitter_profile.startsWith('@') 
                                      ? `https://twitter.com/${submission.twitter_profile.substring(1)}`
                                      : submission.twitter_profile
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-bold"
                                  >
                                    {submission.twitter_profile}
                                  </a>
                                </div>
                                {canSelectWinner && !hasWinner && (
                                  <button
                                    onClick={() => handleSelectApplicantAsWinner(task, submission.applicant_wallet)}
                                    className="bg-blue-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-blue-700"
                                  >
                                    Select as Winner
                                  </button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs font-bold text-gray-600 mb-1">WALLET ADDRESS</p>
                                  <p className="font-mono text-xs break-all text-black">{submission.applicant_wallet}</p>
                                </div>
                                {submission.submission_proof && (
                                  <div>
                                    <p className="text-xs font-bold text-gray-600 mb-1">SUBMISSION PROOF</p>
                                    <a 
                                      href={submission.submission_proof}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm break-all"
                                    >
                                      {submission.submission_proof}
                                    </a>
                                  </div>
                                )}
                                <p className="text-xs font-bold text-gray-600">Applied: {new Date(submission.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {canSelectWinner && !hasWinner && (
                    <button
                      onClick={() => setSelectedTask(task)}
                      className="w-full bg-blue-600 text-white py-3 font-bold rounded hover:bg-blue-700"
                    >
                      Select Winner Manually
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-4 text-black">Select Winner</h2>
            <p className="mb-4 text-black">
              <span className="font-bold">Task:</span> {selectedTask.task_title}
            </p>
            <p className="mb-4 text-black">
              <span className="font-bold">Reward:</span> {(selectedTask.token_amount / 1e6).toLocaleString()} Tokens
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold mb-2 text-black">Winner Wallet Address</label>
              <input
                type="text"
                placeholder="Enter Solana wallet address..."
                value={winnerWallet}
                onChange={(e) => setWinnerWallet(e.target.value)}
                className="w-full bg-gray-50 border-2 p-3 font-mono text-sm rounded text-black"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setWinnerWallet("");
                }}
                className="flex-1 border-2 px-4 py-3 font-bold rounded hover:bg-gray-50 text-black"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSelectWinner}
                disabled={isSubmitting || !winnerWallet}
                className="flex-1 bg-blue-600 text-white px-4 py-3 font-bold rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "CONFIRMING..." : "CONFIRM WINNER"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}