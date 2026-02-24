"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/lib/supabase";
import type { Task, TaskSubmission } from "@/lib/supabase";

export default function TaskBoardPage() {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "ended" | "closed">("all");
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [twitterProfile, setTwitterProfile] = useState("");
  const [applicantWallet, setApplicantWallet] = useState("");
  const [submissionProof, setSubmissionProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userSubmissions, setUserSubmissions] = useState<TaskSubmission[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<TaskSubmission[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadTasks();
    loadAllSubmissions();
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      loadUserSubmissions();
      setApplicantWallet(publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*");

      if (error) throw error;

      setAllSubmissions(data || []);
    } catch (error) {
      console.error("Error loading all submissions:", error);
    }
  };

  const loadUserSubmissions = async () => {
    if (!publicKey) return;

    try {
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*")
        .eq("applicant_wallet", publicKey.toBase58());

      if (error) throw error;

      setUserSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
    }
  };

  const getWinnerTwitter = (task: Task): string | null => {
    if (!task.winner_wallet) return null;
    
    const winnerSubmission = allSubmissions.find(
      sub => sub.task_id === task.id && sub.applicant_wallet === task.winner_wallet
    );
    
    return winnerSubmission?.twitter_profile || null;
  };

  const getTwitterUrl = (twitterProfile: string | null): string => {
    if (!twitterProfile) return "#";
    
    // If it's already a full URL
    if (twitterProfile.startsWith("http")) {
      return twitterProfile;
    }
    
    // Extract username
    let username = twitterProfile;
    if (username.startsWith("@")) {
      username = username.substring(1);
    }
    
    return `https://twitter.com/${username}`;
  };

  const formatTwitterHandle = (twitterProfile: string | null): string => {
    if (!twitterProfile) return "N/A";
    
    // If it's a URL, extract the username
    if (twitterProfile.includes("twitter.com/") || twitterProfile.includes("x.com/")) {
      const parts = twitterProfile.split("/");
      return "@" + parts[parts.length - 1];
    }
    
    // If it starts with @, return as is
    if (twitterProfile.startsWith("@")) {
      return twitterProfile;
    }
    
    // Otherwise add @ prefix
    return "@" + twitterProfile;
  };

  const getTaskStatus = (task: Task) => {
    const now = new Date();
    const deadline = new Date(task.deadline);

    if (task.winner_wallet) return "closed";
    if (task.status === "paid") return "paid";
    if (now >= deadline) return "ended";
    return "active";
  };

  const shouldHideTask = (task: Task): boolean => {
    const status = getTaskStatus(task);
    const now = new Date();
    const deadline = new Date(task.deadline);
    const fourHoursAfterDeadline = new Date(deadline.getTime() + 4 * 60 * 60 * 1000); // deadline + 4 hours
  
    // Hide tasks that are ended or closed and more than 4 hours past deadline
    if ((status === "ended" || status === "closed") && now > fourHoursAfterDeadline) {
      return true;
    }
  
    return false;
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }

    return `${hours}h ${minutes}m remaining`;
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const hasApplied = (taskId: string) => {
    return userSubmissions.some(sub => sub.task_id === taskId);
  };

  const handleApplyToTask = (task: Task) => {
    if (!connected) {
      alert("Please connect your wallet first!");
      setVisible(true);
      return;
    }

    setSelectedTask(task);
    setApplicantWallet(publicKey?.toBase58() || "");
  };

  const handleSubmitApplication = async () => {
    if (!selectedTask || !twitterProfile || !applicantWallet) {
      alert("Please fill in all required fields!");
      return;
    }

    if (!twitterProfile.includes("twitter.com/") && !twitterProfile.includes("x.com/") && !twitterProfile.startsWith("@")) {
      alert("Please enter a valid Twitter profile URL or handle (e.g., @username or https://twitter.com/username)");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("task_submissions")
        .insert([
          {
            task_id: selectedTask.id,
            applicant_wallet: applicantWallet,
            twitter_profile: twitterProfile,
            submission_proof: submissionProof || null,
            status: "pending",
          },
        ])
        .select();

      if (error) throw error;

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedTask(null);
        setTwitterProfile("");
        setSubmissionProof("");
        loadUserSubmissions();
        loadAllSubmissions();
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting application:", error);
      alert("ERROR: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks
    .filter((task) => !shouldHideTask(task)) // Hide tasks older than 2h after deadline
    .filter((task) => {
      const status = getTaskStatus(task);
      if (filter === "all") return true;
      if (filter === "active") return status === "active";
      if (filter === "ended") return status === "ended" || status === "paid";
      if (filter === "closed") return status === "closed";
      return true;
    });

  return (
    <main className="min-h-screen bg-gray-50 p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-4">
            Task Board
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Complete tasks and earn tokens
          </p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { value: "all", label: "All Tasks", color: "bg-[#3C5A99]" },
            { value: "active", label: "Active", color: "bg-green-500" },
            { value: "closed", label: "Closed", color: "bg-red-500" },
            { value: "ended", label: "Ended", color: "bg-gray-700" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              className={`
                px-6 py-3 font-bold rounded-lg transition-all duration-200
                ${
                  filter === f.value
                    ? `${f.color} text-white`
                    : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 shadow-sm"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#3C5A99] border-t-transparent"></div>
            <p className="mt-4 text-xl font-bold text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-gray-200">
            <p className="text-3xl font-black text-gray-400 mb-4">No tasks found</p>
            <p className="text-gray-500">Check back later or create a task yourself</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const status = getTaskStatus(task);
              const isActive = status === "active";
              const isClosed = status === "closed";
              const alreadyApplied = hasApplied(task.id);
              const winnerTwitter = getWinnerTwitter(task);

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-black uppercase
                        ${
                          isClosed
                            ? "bg-red-600 text-white"
                            : isActive
                            ? "bg-green-600 text-white"
                            : status === "paid"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white"
                        }
                      `}
                    >
                      {isClosed ? "Closed" : isActive ? "Active" : status === "paid" ? "Paid" : "Ended"}
                    </span>
                    {alreadyApplied && (
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-yellow-500 text-white">
                        Applied
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-black text-black mb-2 line-clamp-2">
                    {task.task_title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {task.task_description || "No description provided"}
                  </p>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-bold text-gray-600 mb-1">REWARD</p>
                    <p className="text-2xl font-black text-[#3C5A99]">
                      {(task.token_amount / 1e6).toLocaleString()} {task.token_symbol || "Tokens"}
                    </p>
                    <p className="text-xs font-mono text-gray-500 mt-2 break-all">
                      Token: {shortenAddress(task.token_mint)}
                    </p>
                  </div>

                  {/* Winner Info */}
                  {task.winner_wallet && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-bold text-red-600 uppercase mb-1">Winner Selected</p>
                      <p className="text-xs font-mono text-red-800 break-all mb-2">{shortenAddress(task.winner_wallet)}</p>
                      {winnerTwitter && (
                        <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <a 
                            href={getTwitterUrl(winnerTwitter)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-red-700 hover:underline"
                          >
                            {formatTwitterHandle(winnerTwitter)}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-600">Time:</span>
                      <span className="font-black text-black">
                        {formatTimeRemaining(task.deadline)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-600">Deadline:</span>
                      <span className="font-bold text-black">
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    {task.submission_link && (
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-gray-600">Submit to:</span>
                        <a 
                          href={task.submission_link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold text-[#3C5A99] hover:underline"
                        >
                          Link
                        </a>
                      </div>
                    )}
                  </div>

                  {isClosed ? (
                    <div className="text-center py-3 bg-red-100 border-2 border-red-300 rounded-lg text-sm font-bold text-red-700">
                      Task Closed - Winner Selected
                    </div>
                  ) : isActive ? (
                    <button
                      onClick={() => handleApplyToTask(task)}
                      disabled={alreadyApplied}
                      className={`
                        w-full py-3 rounded-lg font-black uppercase text-sm
                        transition-all duration-200
                        ${
                          alreadyApplied
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-[#3C5A99] text-white hover:bg-[#4C6AA9] shadow-md hover:shadow-lg"
                        }
                      `}
                    >
                      {alreadyApplied ? "Already Applied" : "Apply to Task"}
                    </button>
                  ) : (
                    <div className="text-center py-3 bg-gray-100 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-600">
                      Task Ended
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-95 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 md:p-10 max-w-md w-full shadow-lg text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-black text-black mb-3">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">The creator will review your submission.</p>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase mb-4 text-black">Apply to Task</h2>
            
            <div className="mb-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold text-black">Task:</span> {selectedTask.task_title}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-bold text-black">Reward:</span> {(selectedTask.token_amount / 1e6).toLocaleString()} {selectedTask.token_symbol || "Tokens"}
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                Token: {selectedTask.token_mint}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-700">
                  Twitter Profile *
                </label>
                <input
                  type="text"
                  placeholder="@username or https://twitter.com/username"
                  value={twitterProfile}
                  onChange={(e) => setTwitterProfile(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 p-3 text-sm focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your Twitter handle or profile URL</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-700">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  value={applicantWallet}
                  onChange={(e) => setApplicantWallet(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-200 p-3 font-mono text-sm focus:outline-none focus:border-[#3C5A99] rounded text-black"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Tokens will be sent to this address</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-700">
                  Submission Proof (Optional)
                </label>
                <textarea
                  placeholder="Link to your tweet, post, or submission..."
                  value={submissionProof}
                  onChange={(e) => setSubmissionProof(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-gray-200 p-3 text-sm focus:outline-none focus:border-[#3C5A99] rounded text-black placeholder-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Submit proof of completion (can be added later)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setTwitterProfile("");
                  setSubmissionProof("");
                }}
                className="flex-1 border-2 border-gray-300 px-4 py-3 font-bold uppercase hover:bg-gray-50 transition-all rounded text-black"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={isSubmitting || !twitterProfile || !applicantWallet}
                className="flex-1 bg-[#3C5A99] text-white px-4 py-3 font-bold uppercase hover:bg-[#4C6AA9] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                {isSubmitting ? "SUBMITTING..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}