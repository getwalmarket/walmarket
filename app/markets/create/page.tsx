'use client';

import { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Environment variables
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
const MARKET_REGISTRY_ID = process.env.NEXT_PUBLIC_MARKET_REGISTRY_ID || '';
const X402_TREASURY_ID = process.env.NEXT_PUBLIC_X402_TREASURY_ID || '';
const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE || '';
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
const X402_FEE = Number(process.env.NEXT_PUBLIC_X402_FEE || '1000');

const CATEGORIES = ['Crypto', 'Technology', 'DeFi', 'Politics', 'Sports', 'Entertainment', 'Other'];

export default function CreateMarketPage() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Crypto');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);

  async function handleCreateMarket(e: React.FormEvent) {
    e.preventDefault();

    if (!account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!title || !description || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') });

      // Find USDC coins
      const coins = await client.getCoins({
        owner: account.address,
        coinType: USDC_TYPE,
      });

      if (coins.data.length === 0) {
        setError('No USDC found in your wallet. You need 0.001 USDC to create a market.');
        setLoading(false);
        return;
      }

      // Check if we have enough USDC
      const totalUsdc = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));
      if (totalUsdc < BigInt(X402_FEE)) {
        setError(`Insufficient USDC. You have ${Number(totalUsdc) / 1_000_000} USDC, need 0.001 USDC.`);
        setLoading(false);
        return;
      }

      // Convert end date to timestamp
      const endTimestamp = new Date(endDate).getTime();

      // Create walrus blob ID (placeholder - in production this would upload to Walrus)
      const walrusBlobId = `market-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Build transaction
      const tx = new Transaction();

      // Split exact amount for payment
      const [paymentCoin] = tx.splitCoins(tx.object(coins.data[0].coinObjectId), [X402_FEE]);

      // Convert strings to bytes
      const titleBytes = new TextEncoder().encode(title);
      const descriptionBytes = new TextEncoder().encode(description);
      const categoryBytes = new TextEncoder().encode(category);
      const walrusBlobBytes = new TextEncoder().encode(walrusBlobId);

      tx.moveCall({
        target: `${PACKAGE_ID}::market::create_market_x402`,
        typeArguments: [USDC_TYPE],
        arguments: [
          tx.object(MARKET_REGISTRY_ID),
          tx.object(X402_TREASURY_ID),
          paymentCoin,
          tx.pure.vector('u8', Array.from(titleBytes)),
          tx.pure.vector('u8', Array.from(descriptionBytes)),
          tx.pure.vector('u8', Array.from(categoryBytes)),
          tx.pure.u64(endTimestamp),
          tx.pure.vector('u8', Array.from(walrusBlobBytes)),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      setTxDigest(result.digest);
      setSuccess('Market created successfully!');

      // Clear form
      setTitle('');
      setDescription('');
      setEndDate('');

    } catch (err: unknown) {
      console.error('Failed to create market:', err);
      setError(err instanceof Error ? err.message : 'Failed to create market');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">Create Market</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Create a prediction market for 0.001 USDC. AI agents will resolve the outcome.
          </p>
        </div>

        {/* Fee Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 font-bold">$</span>
            </div>
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Creation Fee: 0.001 USDC</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Paid via x402 protocol to prevent spam</p>
            </div>
          </div>
        </div>

        {/* Create Form */}
        <form onSubmit={handleCreateMarket} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Market Question *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Will Bitcoin reach $150,000 by end of 2025?"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Make it a clear yes/no question
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="This market resolves YES if Bitcoin price exceeds $150,000 according to CoinGecko on December 31, 2025."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Describe resolution criteria clearly
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resolution Date *
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              When should the AI oracle resolve this market?
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-600 dark:text-green-400 font-medium">{success}</p>
              {txDigest && (
                <a
                  href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-500 hover:underline mt-2 block"
                >
                  View transaction on Suiscan
                </a>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !account}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
              loading || !account
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Market...
              </span>
            ) : !account ? (
              'Connect Wallet to Create'
            ) : (
              'Create Market (0.001 USDC)'
            )}
          </button>
        </form>

        {/* Info Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">How it works</h3>
          <ol className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span>Pay 0.001 USDC to create your market</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span>Users bet YES or NO with USDT</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <span>AI oracle (GPT, Gemini, Claude) resolves the outcome</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <span>Winners claim their share of the pool</span>
            </li>
          </ol>
        </div>

        {/* Contract Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Contract: {PACKAGE_ID.slice(0, 10)}...{PACKAGE_ID.slice(-8)}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
