'use client';

import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            How AI Oracle Works
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover how Walmarket uses AI-powered oracles to automatically verify prediction market outcomes with unprecedented accuracy and transparency.
          </p>
        </div>

        {/* Overview */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl mb-12 text-white">
          <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
          <p className="mb-4">
            Traditional prediction markets rely on centralized resolution mechanisms, creating single points of failure and potential manipulation.
            Walmarket solves this with a decentralized AI Oracle system that:
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Automatically verifies outcomes using multiple trusted data sources</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Stores all reasoning and proofs permanently on Walrus</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>Eliminates trust requirements through cryptographic verification</span>
            </li>
          </ul>
        </div>

        {/* Architecture Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">System Architecture</h2>

          {/* Diagram */}
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-orange-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold mb-2">Data Collection</h3>
                <p className="text-sm text-gray-600">
                  AI agents monitor multiple trusted data sources in real-time
                </p>
                <div className="mt-4 text-3xl">📊</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="text-4xl text-orange-500">→</div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  GPT-5 processes normalized data using fixed prompts and JSON schema
                </p>
                <div className="mt-4 text-3xl">🤖</div>
              </div>
            </div>

            <div className="flex justify-center my-6">
              <div className="text-4xl text-orange-500">↓</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 3 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold mb-2">Cryptographic Proof</h3>
                <p className="text-sm text-gray-600">
                  Evidence bundle is hashed and stored permanently on Walrus
                </p>
                <div className="mt-4 text-3xl">🔐</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="text-4xl text-orange-500">→</div>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold mb-2">On-Chain Verification</h3>
                <p className="text-sm text-gray-600">
                  SUI smart contracts verify TEE attestation and aggregate results
                </p>
                <div className="mt-4 text-3xl">⛓️</div>
              </div>
            </div>
          </div>
        </div>

        {/* Single Model Policy */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-200 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-blue-900">🎯 Single Model Policy</h2>
          <p className="text-gray-700 mb-4">
            Walmarket uses a unified approach with <strong>GPT-5 as the core AI model</strong> to ensure:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-900">✓ Consistency</h3>
              <p className="text-sm text-gray-600">
                All predictions use the same model version, reducing variance and improving reliability
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-900">✓ Reproducibility</h3>
              <p className="text-sm text-gray-600">
                Fixed prompts, schemas, and model versions enable exact result verification
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-900">✓ Cost Efficiency</h3>
              <p className="text-sm text-gray-600">
                Token caps and caching optimize API costs while maintaining quality
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-900">✓ Easy Auditing</h3>
              <p className="text-sm text-gray-600">
                Single model simplifies verification, debugging, and community review
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Off-Chain TEE Reporter */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
            <h3 className="text-xl font-bold mb-4 text-orange-600">Off-Chain: TEE Reporter</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">1.</span>
                <span><strong>Data Normalization:</strong> Collect and standardize sources from trusted APIs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">2.</span>
                <span><strong>Prompt Template:</strong> Apply fixed system/user prompts with JSON schema enforcement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">3.</span>
                <span><strong>GPT-5 Inference:</strong> Generate resolution with confidence score and cited sources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">4.</span>
                <span><strong>Evidence Bundle:</strong> Package input, output, prompts, and version hashes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">5.</span>
                <span><strong>Walrus Upload:</strong> Store bundle permanently with blob_id and blob_hash</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-orange-600">6.</span>
                <span><strong>TEE Signature:</strong> Sign report with trusted execution environment attestation</span>
              </li>
            </ul>
          </div>

          {/* On-Chain Aggregator */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold mb-4 text-purple-600">On-Chain: SUI Aggregator</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">1.</span>
                <span><strong>Verification:</strong> Validate TEE attestation and blob_hash against Walrus anchor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">2.</span>
                <span><strong>Whitelist Check:</strong> Ensure model_id, prompt_hash, parser_hash match policy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">3.</span>
                <span><strong>Aggregation:</strong> Calculate median value from multiple reporter submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">4.</span>
                <span><strong>Optimistic Challenge:</strong> Allow community to dispute with evidence bond</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">5.</span>
                <span><strong>Slashing:</strong> Penalize format violations or hash mismatches immediately</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-600">6.</span>
                <span><strong>Finalization:</strong> Market resolves with confidence score and source citations</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Resolution Schema */}
        <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-200 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-green-900">📋 Resolution Schema</h2>
          <p className="text-gray-700 mb-4">
            Every AI Oracle output follows a standardized JSON format for transparency and verifiability:
          </p>
          <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm">
{`{
  "round": 12345,
  "task": "binary",
  "resolution": {
    "value": 1,           // 1=YES, 0=NO (or numeric value)
    "confidence": 0.87    // 0.0 to 1.0
  },
  "sources": [
    {
      "id": "reuters:article123",
      "url": "https://...",
      "quote_hash": "0xabc..."
    }
  ],
  "rationale": "Candidate A won with 52.3% of votes...",
  "controls": {
    "model_id": "gpt-5-thinking@2025-11-POC",
    "prompt_hash": "0x...",
    "parser_hash": "0x...",
    "schema_hash": "0x..."
  }
}`}
          </pre>
        </div>

        {/* Security Features */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-xl mb-12 text-white">
          <h2 className="text-2xl font-bold mb-6">🛡️ Security & Trust</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2 text-lg">Trusted Execution Environment (TEE)</h3>
              <p className="text-sm opacity-90">
                AI inference runs in secure enclaves with remote attestation, ensuring operators cannot tamper with results
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-lg">Immutable Evidence Storage</h3>
              <p className="text-sm opacity-90">
                All input data, AI reasoning, and source citations stored permanently on Walrus for post-hoc auditing
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-lg">Optimistic Challenge System</h3>
              <p className="text-sm opacity-90">
                Community can dispute resolutions with evidence bonds, creating a secondary safety layer
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-lg">Economic Penalties</h3>
              <p className="text-sm opacity-90">
                Automatic slashing for format violations, hash mismatches, or invalid source citations
              </p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why This Matters</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Real-Time Resolution</h3>
              <p className="text-gray-600 text-sm">
                Markets resolve instantly when conditions are met, no manual intervention required
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-colors">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">Full Transparency</h3>
              <p className="text-gray-600 text-sm">
                Every decision is auditable with complete source data and AI reasoning stored on-chain
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3">87.3% Accuracy</h3>
              <p className="text-gray-600 text-sm">
                AI Oracle achieves industry-leading accuracy through multi-source verification and confidence scoring
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-xl text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Experience AI-Powered Markets?</h2>
          <p className="mb-6 opacity-90">
            See our AI Oracle in action on live prediction markets
          </p>
          <Link
            href="/markets"
            className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Explore Markets
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
