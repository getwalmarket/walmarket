'use client';

import Link from "next/link";
import Image from "next/image";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useState, useEffect } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

// Types for Market data from blockchain
interface MarketData {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: number;
  yesPool: number;
  noPool: number;
  status: number; // 0 = Active, 1 = Resolved YES, 2 = Resolved NO
  outcome: number;
  creator: string;
  resolverAiProvider: string;
  resolverAiModel: string;
  resolverAiReasoning: string;
}

// Helper to decode vector<u8> to string
function decodeBytes(bytes: number[]): string {
  if (!bytes || bytes.length === 0) return '';
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// Environment variables
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MARKET_REGISTRY_ID = process.env.NEXT_PUBLIC_MARKET_REGISTRY_ID || '';
const X402_TREASURY_ID = process.env.NEXT_PUBLIC_X402_TREASURY_ID || '';
const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE || '';
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
const X402_FEE = Number(process.env.NEXT_PUBLIC_X402_FEE || '1000');

const CATEGORIES = ['All', 'Crypto', 'Technology', 'DeFi', 'Politics', 'Infrastructure'];
const STATUS_FILTERS = ['All', 'Active', 'Resolved', 'Ready to Resolve'];

export default function MarketsPage() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [resolvingMarketId, setResolvingMarketId] = useState<string | null>(null);
  const [resolveResult, setResolveResult] = useState<{
    marketId: string;
    outcome: string;
    reasoning: string;
    txDigest: string;
  } | null>(null);

  useEffect(() => {
    fetchMarkets();
  }, []);

  async function fetchMarkets() {
    try {
      setLoading(true);
      setError(null);

      const client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') });

      const response = await client.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::market::MarketCreated`
        },
        limit: 50,
        order: 'descending'
      });

      const marketIds = response.data.map((event: { parsedJson?: { market_id?: string } }) => event.parsedJson?.market_id).filter(Boolean);

      const marketPromises = marketIds.map(async (marketId: string) => {
        try {
          const marketObj = await client.getObject({
            id: marketId,
            options: { showContent: true }
          });

          if (marketObj.data?.content?.dataType === 'moveObject') {
            const fields = (marketObj.data.content as { fields: Record<string, unknown> }).fields;
            return {
              id: marketId,
              title: decodeBytes(fields.title as number[]),
              description: decodeBytes(fields.description as number[]),
              category: decodeBytes(fields.category as number[]),
              endDate: Number(fields.end_date),
              yesPool: Number(fields.yes_pool) / 1_000_000,
              noPool: Number(fields.no_pool) / 1_000_000,
              status: Number(fields.status),
              outcome: Number(fields.outcome),
              creator: fields.creator as string,
              resolverAiProvider: decodeBytes((fields.resolver_ai_provider as number[]) || []),
              resolverAiModel: decodeBytes((fields.resolver_ai_model as number[]) || []),
              resolverAiReasoning: decodeBytes((fields.resolver_ai_reasoning as number[]) || []),
            };
          }
          return null;
        } catch (err) {
          console.error(`Failed to fetch market ${marketId}:`, err);
          return null;
        }
      });

      const fetchedMarkets = (await Promise.all(marketPromises)).filter(Boolean) as MarketData[];
      setMarkets(fetchedMarkets);
    } catch (err) {
      console.error('Failed to fetch markets:', err);
      setError('Failed to load markets from blockchain');
    } finally {
      setLoading(false);
    }
  }

  // Check if market is ready to resolve (end date passed and not yet resolved)
  const isReadyToResolve = (market: MarketData) => {
    return market.status === 0 && Date.now() >= market.endDate;
  };

  // Call OpenAI GPT to get resolution
  async function getAIResolution(market: MarketData): Promise<{ outcome: 'yes' | 'no', reasoning: string }> {
    const response = await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: market.title,
        description: market.description,
        category: market.category,
        endDate: market.endDate,
      }),
    });

    if (!response.ok) {
      throw new Error('AI resolution failed');
    }

    return response.json();
  }

  // Resolve market with AI
  async function handleResolveMarket(market: MarketData, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setResolvingMarketId(market.id);

    try {
      // Step 1: Get AI resolution
      const aiResult = await getAIResolution(market);

      // Step 2: Get USDC coins
      const client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') });
      const coins = await client.getCoins({
        owner: account.address,
        coinType: USDC_TYPE,
      });

      if (coins.data.length === 0) {
        alert('No USDC found in your wallet. You need 0.001 USDC to resolve.');
        return;
      }

      // Step 3: Build transaction
      const tx = new Transaction();
      const [paymentCoin] = tx.splitCoins(tx.object(coins.data[0].coinObjectId), [X402_FEE]);

      const outcomeValue = aiResult.outcome === 'yes' ? 1 : 2;

      tx.moveCall({
        target: `${PACKAGE_ID}::market::resolve_market_x402`,
        typeArguments: [USDC_TYPE],
        arguments: [
          tx.object(market.id),
          tx.object(X402_TREASURY_ID),
          paymentCoin,
          tx.pure.u8(outcomeValue),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(`resolution-${Date.now()}`))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode('openai'))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode('gpt-5-mini'))),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(aiResult.reasoning))),
        ],
      });

      const result = await signAndExecuteTransaction({ transaction: tx });
      setResolveResult({
        marketId: market.id,
        outcome: aiResult.outcome,
        reasoning: aiResult.reasoning,
        txDigest: result.digest,
      });
      fetchMarkets();
    } catch (err: unknown) {
      console.error('Failed to resolve market:', err);
      alert(`Failed to resolve: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setResolvingMarketId(null);
    }
  }

  // Filter markets
  const filteredMarkets = markets.filter(market => {
    const categoryMatch = selectedCategory === 'All' || market.category === selectedCategory;
    const statusMatch =
      selectedStatus === 'All' ||
      (selectedStatus === 'Active' && market.status === 0 && !isReadyToResolve(market)) ||
      (selectedStatus === 'Resolved' && market.status !== 0) ||
      (selectedStatus === 'Ready to Resolve' && isReadyToResolve(market));
    return categoryMatch && statusMatch;
  });

  // Calculate stats
  const totalVolume = markets.reduce((sum, m) => sum + m.yesPool + m.noPool, 0);
  const activeMarkets = markets.filter(m => m.status === 0 && !isReadyToResolve(m)).length;
  const resolvedMarkets = markets.filter(m => m.status !== 0).length;
  const readyToResolveMarkets = markets.filter(m => isReadyToResolve(m)).length;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (market: MarketData) => {
    if (market.status === 0) {
      if (isReadyToResolve(market)) {
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Ready to Resolve</span>;
      }
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Active</span>;
    } else if (market.status === 1 || market.outcome === 1) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Resolved: YES</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Resolved: NO</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Resolution Result Modal */}
      {resolveResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                resolveResult.outcome === 'yes'
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                <span className="text-3xl">{resolveResult.outcome === 'yes' ? '✓' : '✗'}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Market Resolved: {resolveResult.outcome.toUpperCase()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI Oracle (GPT-5-mini) has determined the outcome
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Reasoning:</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{resolveResult.reasoning}</p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={`https://suiscan.xyz/testnet/tx/${resolveResult.txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-center transition-colors"
              >
                View on Sui Explorer
              </a>
              <Link
                href={`/markets/${resolveResult.marketId}`}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-center transition-colors"
              >
                View Market Details
              </Link>
              <button
                onClick={() => setResolveResult(null)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">Prediction Markets</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Trade on the outcome of real-world events. AI-powered resolution with on-chain transparency.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-5 py-2 rounded-lg font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {status}
              {status === 'Active' && ` (${activeMarkets})`}
              {status === 'Resolved' && ` (${resolvedMarkets})`}
              {status === 'Ready to Resolve' && ` (${readyToResolveMarkets})`}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-orange-200 dark:border-orange-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Markets</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{markets.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeMarkets}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ready to Resolve</div>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{readyToResolveMarkets}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedMarkets}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-orange-200 dark:border-orange-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</div>
            <div className="flex items-center gap-2">
              <Image src="/usdt.png" alt="USDT" width={24} height={24} className="w-6 h-6" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalVolume.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading markets from blockchain...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchMarkets}
              className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredMarkets.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No markets found</p>
            <p className="text-gray-500 dark:text-gray-500">
              {markets.length === 0
                ? 'No markets have been created yet on this contract.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        )}

        {/* Markets Grid */}
        {!loading && !error && filteredMarkets.length > 0 && (
          <div className="grid gap-6">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-700"
              >
                <Link href={`/markets/${market.id}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
                          {market.category || 'General'}
                        </span>
                        {getStatusBadge(market)}
                        {market.resolverAiModel && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                            AI: {market.resolverAiModel}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{market.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{market.description}</p>
                    </div>
                  </div>

                  {/* AI Resolution Info */}
                  {market.status !== 0 && market.resolverAiReasoning && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-700 dark:text-purple-300 font-medium text-sm">
                          AI Resolution ({market.resolverAiProvider} / {market.resolverAiModel})
                        </span>
                      </div>
                      <p className="text-purple-600 dark:text-purple-400 text-sm line-clamp-2">
                        {market.resolverAiReasoning}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">YES Pool</div>
                          <div className="flex items-center gap-1.5">
                            <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                              {market.yesPool.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">NO Pool</div>
                          <div className="flex items-center gap-1.5">
                            <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                              {market.noPool.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</div>
                          <div className="flex items-center gap-1.5">
                            <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {(market.yesPool + market.noPool).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">End Date</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(market.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Resolve Button - Only show for markets ready to resolve */}
                {isReadyToResolve(market) && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <button
                      onClick={(e) => handleResolveMarket(market, e)}
                      disabled={resolvingMarketId === market.id || !account}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {resolvingMarketId === market.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          AI Resolving...
                        </>
                      ) : (
                        <>
                          <span>🤖</span>
                          Resolve with AI (0.001 USDC)
                        </>
                      )}
                    </button>
                    {!account && (
                      <p className="text-xs text-center text-gray-500 mt-2">Connect wallet to resolve</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Market CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-xl text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Have a question for the crowd?</h3>
          <p className="mb-6 opacity-90">Create your own prediction market and let AI-powered oracles resolve the outcome.</p>
          <Link
            href="/markets/create"
            className="inline-block px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Market (0.001 USDC)
          </Link>
        </div>

        {/* Contract Info */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>Contract: {PACKAGE_ID.slice(0, 10)}...{PACKAGE_ID.slice(-8)}</p>
          <p>Network: {SUI_NETWORK}</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
