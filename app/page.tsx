import Link from "next/link";
import Image from "next/image";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              src="/icon-txt.png"
              alt="Walmarket"
              width={1000}
              height={300}
              priority
              className="w-full max-w-3xl h-auto px-4"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-orange-600 px-4">
            Decentralized Truth Through Markets
          </h2>
          <p className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto mb-10 px-4 leading-relaxed">
            A prediction market platform powered by Walrus and SUI. Where collective intelligence meets blockchain transparency to create verifiable truth.
          </p>
          <Link
            href="/markets"
            className="inline-block px-10 py-4 bg-orange-500 text-white text-lg font-bold hover:bg-orange-600 transition-all border-4 border-orange-600 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px]"
          >
            LAUNCH APP
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 px-4">
          <div className="bg-white p-6 border-4 border-orange-400 hover:border-orange-500 transition-all shadow-[4px_4px_0px_0px_rgba(251,146,60,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(251,146,60,0.5)] hover:-translate-y-1">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-lg font-bold mb-3 text-orange-600">Predict the Future</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Create and participate in prediction markets on real-world events. Put your knowledge to work and earn from accurate predictions.
            </p>
          </div>

          <div className="bg-white p-6 border-4 border-orange-400 hover:border-orange-500 transition-all shadow-[4px_4px_0px_0px_rgba(251,146,60,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(251,146,60,0.5)] hover:-translate-y-1">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-bold mb-3 text-orange-600">AI Oracle Verification</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Advanced AI agents automatically verify market outcomes using real-world data sources, ensuring accurate and unbiased resolution.
            </p>
          </div>

          <div className="bg-white p-6 border-4 border-orange-400 hover:border-orange-500 transition-all shadow-[4px_4px_0px_0px_rgba(251,146,60,0.4)] hover:shadow-[6px_6px_0px_0px_rgba(251,146,60,0.5)] hover:-translate-y-1">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-bold mb-3 text-orange-600">Earn from Accuracy</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Market participants who make accurate predictions earn rewards. Incentivizing truth-seeking through economic mechanisms.
            </p>
          </div>
        </div>

        {/* AI Oracle Feature Highlight */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 mx-4 mb-12 border-4 border-purple-700 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🤖</div>
            <h3 className="text-xl md:text-2xl font-bold">AI-Powered Truth Oracle</h3>
          </div>
          <p className="mb-4 text-sm md:text-base">
            Walmarket uses cutting-edge AI agents to automatically resolve prediction markets with unprecedented accuracy and transparency:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">🔍 Multi-Source Verification</h4>
              <p className="text-xs opacity-90">AI agents cross-reference multiple trusted data sources to verify outcomes</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">⚡ Real-Time Resolution</h4>
              <p className="text-xs opacity-90">Instant market resolution when conditions are met, no manual intervention needed</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">📊 Transparent Reasoning</h4>
              <p className="text-xs opacity-90">AI decision process stored on Walrus for full auditability</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">🛡️ Dispute Prevention</h4>
              <p className="text-xs opacity-90">Cryptographic proofs eliminate ambiguity and reduce disputes</p>
            </div>
          </div>
          <p className="text-xs md:text-sm opacity-90 italic">
            Our AI Oracle combines the wisdom of prediction markets with the reliability of AI verification,
            creating the most trustworthy truth engine in Web3.
          </p>
        </div>

        {/* About Walrus Hackathon */}
        <div className="bg-orange-500 p-8 mx-4 border-4 border-orange-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] text-white">
          <h3 className="text-xl md:text-2xl font-bold mb-4">Built for Walrus Haulout Hackathon</h3>
          <p className="mb-4 text-sm md:text-base">
            Walmarket is a submission for the Provably Authentic track, creating a truth engine through prediction markets.
            By combining SUI&apos;s infrastructure with Walrus storage and AI verification, we enable:
          </p>
          <ul className="space-y-2 mb-4 text-sm md:text-base">
            <li>✓ AI-powered oracle for automated market resolution</li>
            <li>✓ Decentralized data storage for market outcomes on Walrus</li>
            <li>✓ Cryptographic proof of prediction authenticity</li>
            <li>✓ Economic incentives for accurate truth reporting</li>
            <li>✓ Transparent, immutable record of collective intelligence</li>
          </ul>
          <p className="text-xs md:text-sm opacity-90">
            Prediction markets have proven to be more accurate than polls and expert opinions.
            Walmarket brings this power to the blockchain with AI verification, creating unstoppable truth infrastructure.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-orange-400 bg-white/90 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p className="text-sm font-bold">Built on SUI • Powered by Walrus • Hackathon 2025</p>
        </div>
      </footer>
    </div>
  );
}
