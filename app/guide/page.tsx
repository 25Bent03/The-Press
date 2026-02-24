"use client";

export default function GuidePage() {
  const creatorSteps = [
    {
      number: "1",
      title: "Connect Your Wallet",
      description: "Click 'Connect Wallet' and select Solflare. Make sure you're on Solana Devnet for testing."
    },
    {
      number: "2",
      title: "Navigate to Create",
      description: "Go to the 'Create' page from the navigation menu at the top."
    },
    {
      number: "3",
      title: "Fill in Task Details",
      description: "Enter your task title, description, submission link, token mint address, token symbol, reward amount, and duration."
    },
    {
      number: "4",
      title: "Lock Tokens",
      description: "Click 'Create Task & Lock Tokens'. Your tokens will be locked in escrow until a winner is selected."
    },
    {
      number: "5",
      title: "Review Applications",
      description: "Go to your Dashboard to see all applicants. You can view their Twitter profiles and wallet addresses."
    },
    {
      number: "6",
      title: "Select Winner",
      description: "6 hours before the deadline, you can select a winner. Tokens will be automatically sent when the deadline is reached."
    }
  ];

  const holderSteps = [
    {
      number: "1",
      title: "Browse Tasks",
      description: "Visit the 'Tasks' page to see all available tasks from different creators."
    },
    {
      number: "2",
      title: "Find Interesting Tasks",
      description: "Use filters (All, Active, Ended) to find tasks that match your interests and skills."
    },
    {
      number: "3",
      title: "Apply to Task",
      description: "Click 'Apply to Task', connect your wallet, and enter your Twitter profile."
    },
    {
      number: "4",
      title: "Submit Your Work",
      description: "Complete the task and submit proof via the submission link provided by the creator."
    },
    {
      number: "5",
      title: "Wait for Selection",
      description: "The creator will review all submissions and select a winner 6 hours before the deadline."
    },
    {
      number: "6",
      title: "Receive Tokens",
      description: "If you're selected as the winner, tokens will be automatically sent to your wallet after the deadline."
    }
  ];

  const StepCard = ({ step, isLast }: { step: any; isLast: boolean }) => (
    <div className="relative">
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 bg-[#3C5A99] rounded-full flex items-center justify-center">
            <span className="text-white font-black text-2xl">{step.number}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-black mb-2">
              {step.title}
            </h3>
            <p className="text-gray-700 leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>
      
      {!isLast && (
        <div className="flex justify-center py-4">
          <svg className="w-8 h-8 text-[#3C5A99]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8 md:p-12">
      <style jsx>{`
        @keyframes popInLoop1 {
          0% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          3% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          77% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
        }

        @keyframes popInLoop2 {
          0% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          13% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          16% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          77% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
        }

        @keyframes popInLoop3 {
          0% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          26% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          29% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          77% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
        }

        @keyframes popInLoop4 {
          0% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          39% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          42% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          77% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
        }

        @keyframes popInLoop5 {
          0% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          52% {
            opacity: 0;
            transform: scale(0.5) translateX(100px);
          }
          55% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          70% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
          77% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateX(-100px);
          }
        }
        
        .animate-pop-1 {
          animation: popInLoop1 18s ease-in-out 0s infinite;
        }
        .animate-pop-2 {
          animation: popInLoop2 18s ease-in-out 0s infinite;
        }
        .animate-pop-3 {
          animation: popInLoop3 18s ease-in-out 0s infinite;
        }
        .animate-pop-4 {
          animation: popInLoop4 18s ease-in-out 0s infinite;
        }
        .animate-pop-5 {
          animation: popInLoop5 18s ease-in-out 0s infinite;
        }

        @keyframes dotActive1 {
          0% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          3% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          16% { background-color: rgb(209, 213, 219); transform: scale(1); }
          100% { background-color: rgb(209, 213, 219); transform: scale(1); }
        }

        @keyframes dotActive2 {
          0% { background-color: rgb(209, 213, 219); transform: scale(1); }
          13% { background-color: rgb(209, 213, 219); transform: scale(1); }
          16% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          29% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          32% { background-color: rgb(209, 213, 219); transform: scale(1); }
          100% { background-color: rgb(209, 213, 219); transform: scale(1); }
        }

        @keyframes dotActive3 {
          0% { background-color: rgb(209, 213, 219); transform: scale(1); }
          26% { background-color: rgb(209, 213, 219); transform: scale(1); }
          29% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          42% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          45% { background-color: rgb(209, 213, 219); transform: scale(1); }
          100% { background-color: rgb(209, 213, 219); transform: scale(1); }
        }

        @keyframes dotActive4 {
          0% { background-color: rgb(209, 213, 219); transform: scale(1); }
          39% { background-color: rgb(209, 213, 219); transform: scale(1); }
          42% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          55% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          58% { background-color: rgb(209, 213, 219); transform: scale(1); }
          100% { background-color: rgb(209, 213, 219); transform: scale(1); }
        }

        @keyframes dotActive5 {
          0% { background-color: rgb(209, 213, 219); transform: scale(1); }
          52% { background-color: rgb(209, 213, 219); transform: scale(1); }
          55% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          70% { background-color: rgb(59, 130, 246); transform: scale(1.2); }
          73% { background-color: rgb(209, 213, 219); transform: scale(1); }
          100% { background-color: rgb(209, 213, 219); transform: scale(1); }
        }

        .animate-dot-1 {
          animation: dotActive1 18s ease-in-out 0s infinite;
        }
        .animate-dot-2 {
          animation: dotActive2 18s ease-in-out 0s infinite;
        }
        .animate-dot-3 {
          animation: dotActive3 18s ease-in-out 0s infinite;
        }
        .animate-dot-4 {
          animation: dotActive4 18s ease-in-out 0s infinite;
        }
        .animate-dot-5 {
          animation: dotActive5 18s ease-in-out 0s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-black mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
            A step-by-step guide to using The Press - the decentralized task marketplace on Solana
          </p>
        </div>

        {/* Animated Flow Diagram */}
        <div className="mb-20 bg-white border-2 border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-12 text-center">
            Procedure
          </h2>
          
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-6xl mx-auto min-h-[300px]">
            {/* Step 1: Creator Creates & Locks */}
            <div className="flex flex-col items-center animate-pop-1 opacity-0">
              <div className="relative bg-white border-2 border-[#3C5A99] rounded-xl p-6 w-52 h-52 flex flex-col items-center justify-center shadow-lg">
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-12 h-12 bg-[#3C5A99] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-black font-bold text-sm text-center">Creator</p>
                <p className="text-gray-600 text-xs text-center mt-1">Creates task and locks tokens</p>
              </div>
              <p className="text-black text-sm mt-3 font-bold">Step 1</p>
            </div>

            {/* Step 2: Escrow (Vault) */}
            <div className="flex flex-col items-center animate-pop-2 opacity-0">
              <div className="relative bg-white border-2 border-gray-300 rounded-xl p-6 w-52 h-52 flex flex-col items-center justify-center shadow-lg">
                {/* Vault/Safe Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mb-2 relative border-4 border-gray-800 shadow-xl">
                  {/* Vault Door */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-md border-2 border-yellow-600"></div>
                  {/* Lock Circle */}
                  <div className="relative w-10 h-10 bg-yellow-500 rounded-full border-3 border-yellow-600 flex items-center justify-center z-10">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  </div>
                  {/* Combination Dial Marks */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-green-500 rounded-full"></div>
                  <div className="absolute top-1 left-1 w-1 h-1 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-black font-bold text-sm text-center mt-2">Escrow</p>
                <p className="text-gray-600 text-xs text-center mt-1">Tokens stored in secure vault</p>
              </div>
              <p className="text-black text-sm mt-3 font-bold">Step 2</p>
            </div>

            {/* Step 3: Holder Accepts */}
            <div className="flex flex-col items-center animate-pop-3 opacity-0">
              <div className="relative bg-white border-2 border-gray-300 rounded-xl p-6 w-52 h-52 flex flex-col items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-black font-bold text-sm text-center">Holder</p>
                <p className="text-gray-600 text-xs text-center mt-1">Accepts task and submits work</p>
              </div>
              <p className="text-black text-sm mt-3 font-bold">Step 3</p>
            </div>

            {/* Step 4: Escrow Releases Tokens */}
            <div className="flex flex-col items-center animate-pop-4 opacity-0">
              <div className="relative bg-white border-2 border-green-500 rounded-xl p-6 w-52 h-52 flex flex-col items-center justify-center shadow-lg">
                {/* Vault/Safe Icon - OPEN */}
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center mb-2 relative border-4 border-gray-800 shadow-xl">
                  {/* Vault Door */}
                  <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-md border-2 border-green-500"></div>
                  {/* Lock Circle - GREEN (UNLOCKED) */}
                  <div className="relative w-10 h-10 bg-green-500 rounded-full border-3 border-green-600 flex items-center justify-center z-10">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Combination Dial Marks */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full"></div>
                  <div className="absolute bottom-1 right-1 w-1 h-1 bg-green-500 rounded-full"></div>
                  <div className="absolute top-1 left-1 w-1 h-1 bg-green-300 rounded-full"></div>
                </div>
                <p className="text-black font-bold text-sm text-center mt-2">Release</p>
                <p className="text-gray-600 text-xs text-center mt-1">Escrow releases tokens automatically</p>
              </div>
              <p className="text-black text-sm mt-3 font-bold">Step 4</p>
            </div>

            {/* Step 5: Receive Tokens */}
            <div className="flex flex-col items-center animate-pop-5 opacity-0">
              <div className="relative bg-white border-2 border-green-500 rounded-xl p-6 w-52 h-52 flex flex-col items-center justify-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-black font-bold text-sm text-center">Receive</p>
                <p className="text-gray-600 text-xs text-center mt-1">Winner receives tokens</p>
              </div>
              <p className="text-black text-sm mt-3 font-bold">Step 5</p>
            </div>
          </div>

          <p className="text-gray-700 text-center mt-12 max-w-3xl mx-auto">
            Every task is secured by smart contract escrow. Tokens are automatically distributed to winners when the deadline is reached.
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-dot-1"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-dot-2"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-dot-3"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-dot-4"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 animate-dot-5"></div>
          </div>
        </div>

        {/* For Creators */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-3">For Creators</h2>
            <p className="text-lg text-gray-600">Create tasks and reward your community</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {creatorSteps.map((step, index) => (
              <StepCard key={index} step={step} isLast={index === creatorSteps.length - 1} />
            ))}
          </div>
        </div>

        {/* For Token Holders */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-3">For Token Holders</h2>
            <p className="text-lg text-gray-600">Complete tasks and earn rewards</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {holderSteps.map((step, index) => (
              <StepCard key={index} step={step} isLast={index === holderSteps.length - 1} />
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-gradient-to-br from-white to-gray-100 border-2 border-gray-200 rounded-2xl p-8 md:p-12 mb-16 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C5A99] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-2">Secure Escrow</h3>
              <p className="text-gray-700">Tokens are locked in escrow until a winner is selected, ensuring fair distribution.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C5A99] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-2">Automatic Payouts</h3>
              <p className="text-gray-700">Winners receive tokens automatically after the deadline - no manual transfers needed.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#3C5A99] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-black mb-2">Decentralized</h3>
              <p className="text-gray-700">Built on Solana blockchain for fast, low-cost, and transparent transactions.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[#3C5A99] to-[#4C6AA9] text-white rounded-2xl p-8 md:p-12 text-center shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-black mb-4">Ready to Get Started?</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of creators and token holders using The Press to build engaged communities on Solana.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="/" 
              className="inline-block bg-white text-[#3C5A99] px-8 py-4 font-bold uppercase rounded-lg shadow-lg"
            >
              Create Task
            </a>
            <a 
              href="/tasks" 
              className="inline-block border-2 border-white text-white px-8 py-4 font-bold uppercase rounded-lg"
            >
              Browse Tasks
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}