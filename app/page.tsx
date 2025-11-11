import Link from "next/link";
import Image from "next/image";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

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
              width={1024}
              height={576}
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
            <Link
              href="/markets"
              className="inline-block px-6 sm:px-10 py-3 sm:py-4 bg-orange-500 text-white text-base sm:text-lg font-bold hover:bg-orange-600 transition-all border-3 sm:border-4 border-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[3px] sm:hover:translate-y-[3px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[6px] sm:active:translate-y-[6px] text-center"
            >
              LAUNCH APP
            </Link>
            <Link
              href="/how-it-works"
              className="inline-block px-6 sm:px-10 py-3 sm:py-4 bg-white text-orange-600 text-base sm:text-lg font-bold hover:bg-gray-50 transition-all border-3 sm:border-4 border-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] sm:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[3px] sm:hover:translate-y-[3px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] sm:active:translate-x-[6px] sm:active:translate-y-[6px] text-center"
            >
              HOW IT WORKS
            </Link>
          </div>
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
            <h3 className="text-xl md:text-2xl font-bold">Verifiable AI Oracle powered by Nautilus TEE</h3>
          </div>
          <p className="mb-4 text-sm md:text-base">
            Walmarket combines GPT-5, Nautilus TEE, and cryptographic proofs to create the world&apos;s first truly verifiable AI oracle:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">🔐 TEE Execution</h4>
              <p className="text-xs opacity-90">AI inference runs inside Nautilus secure enclaves with cryptographic attestation</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">🔍 Multi-Source Verification</h4>
              <p className="text-xs opacity-90">Cross-reference multiple trusted data sources for accurate outcomes</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">📊 Transparent Reasoning</h4>
              <p className="text-xs opacity-90">Complete evidence bundle stored on Walrus for full auditability</p>
            </div>
            <div className="bg-white/10 p-4 rounded border-2 border-white/30">
              <h4 className="font-bold mb-2 text-sm">⚡ On-Chain Verification</h4>
              <p className="text-xs opacity-90">SUI smart contracts verify TEE attestation and aggregate verified reports</p>
            </div>
          </div>
          <p className="text-xs md:text-sm opacity-90 italic">
            The only prediction market oracle that proves AI execution integrity through trusted hardware - no trust required.
          </p>
        </div>

        {/* Tech Stack Highlight */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 px-4">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 p-6 border-4 border-green-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-white">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-lg font-bold mb-3">Nautilus TEE</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Trusted Execution Environment ensures AI inference cannot be tampered with, providing cryptographic proof of execution.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 border-4 border-purple-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-white">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-bold mb-3">SUI Blockchain</h3>
            <p className="text-sm leading-relaxed opacity-90">
              High-performance Layer 1 with Move smart contracts for secure, efficient market resolution and aggregation.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 border-4 border-blue-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-white">
            <div className="text-4xl mb-4">🦭</div>
            <h3 className="text-lg font-bold mb-3">Walrus Storage</h3>
            <p className="text-sm leading-relaxed opacity-90">
              Decentralized storage for permanent, immutable evidence bundles with cryptographic integrity guarantees.
            </p>
          </div>
        </div>

        {/* About Walrus Hackathon */}
        <div className="bg-orange-500 p-8 mx-4 border-4 border-orange-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] text-white">
          <h3 className="text-xl md:text-2xl font-bold mb-4">Built for Walrus Haulout Hackathon 2025</h3>
          <p className="mb-4 text-sm md:text-base">
            Walmarket is a submission for the <strong>Provably Authentic</strong> track, creating a verifiable truth engine through prediction markets.
            By combining SUI, Walrus storage, Nautilus TEE, and GPT-5, we deliver:
          </p>
          <ul className="space-y-2 mb-4 text-sm md:text-base">
            <li>✓ <strong>Verifiable AI Oracle</strong> - TEE-powered GPT-5 inference with cryptographic attestation</li>
            <li>✓ <strong>Immutable Evidence Storage</strong> - Complete audit trail on Walrus with blob hash verification</li>
            <li>✓ <strong>On-Chain Verification</strong> - SUI smart contracts validate TEE signatures and aggregate reports</li>
            <li>✓ <strong>Economic Truth Incentives</strong> - Stake, slash, and reward mechanisms for accuracy</li>
            <li>✓ <strong>Trustless Resolution</strong> - No operator trust required thanks to secure hardware proofs</li>
          </ul>
          <p className="text-xs md:text-sm opacity-90">
            Prediction markets are proven to be more accurate than polls and expert opinions.
            Walmarket brings this power to Web3 with <strong>verifiable AI execution</strong>, creating unstoppable truth infrastructure.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
