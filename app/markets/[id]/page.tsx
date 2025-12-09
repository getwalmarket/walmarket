'use client';

import { use, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../../components/Header";
import { WalletButton } from "../../components/WalletButton";
import { Footer } from "../../components/Footer";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useUSDTBalance } from "../../hooks/useUSDTBalance";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

// Environment variables
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

// Helper to decode vector<u8> to string
function decodeBytes(bytes: number[]): string {
  if (!bytes || bytes.length === 0) return '';
  return new TextDecoder().decode(new Uint8Array(bytes));
}

interface MarketData {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: number;
  yesPool: number;
  noPool: number;
  status: number;
  outcome: number;
  creator: string;
  resolverAiProvider: string;
  resolverAiModel: string;
  resolverAiReasoning: string;
  oracleEvidenceBlobId: string;
  walrusMetadataBlobId: string;
}

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const account = useCurrentAccount();
  const { balance: usdtBalance, isLoading: isUsdtLoading } = useUSDTBalance();

  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    fetchMarket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchMarket() {
    try {
      setLoading(true);
      setError(null);

      const client = new SuiClient({ url: getFullnodeUrl(SUI_NETWORK as 'testnet' | 'mainnet' | 'devnet') });

      const marketObj = await client.getObject({
        id: id,
        options: { showContent: true }
      });

      if (marketObj.data?.content?.dataType === 'moveObject') {
        const fields = (marketObj.data.content as { fields: Record<string, unknown> }).fields;
        setMarket({
          id: id,
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
          oracleEvidenceBlobId: decodeBytes((fields.oracle_evidence_blob_id as number[]) || []),
          walrusMetadataBlobId: decodeBytes((fields.walrus_metadata_blob_id as number[]) || []),
        });
      } else {
        setError('Market not found');
      }
    } catch (err) {
      console.error('Failed to fetch market:', err);
      setError('Failed to load market');
    } finally {
      setLoading(false);
    }
  }

  const handlePlaceBet = async () => {
    // ... (betting logic)
    alert('Betting feature coming soon!');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = () => {
    if (!market) return null;
    if (market.status === 0) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Active</span>;
    } else if (market.status === 1 || market.outcome === 1) {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Resolved: YES</span>;
    } else {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Resolved: NO</span>;
    }
  };

  const isReadyToResolve = () => {
    if (!market || !account) return false;
    if (market.status !== 0) return false;
    const now = Date.now();
    return now >= market.endDate || account.address === market.creator;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading market...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Market Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'This market does not exist.'}</p>
          <Link href="/markets" className="text-orange-600 hover:underline">
            Return to Markets
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const totalPool = market.yesPool + market.noPool;
  const yesPercentage = totalPool > 0 ? (market.yesPool / totalPool) * 100 : 50;
  const noPercentage = totalPool > 0 ? (market.noPool / totalPool) * 100 : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm">
          <Link href="/markets" className="text-orange-600 hover:underline">
            Markets
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">Detail</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
                    {market.category || 'General'}
                  </span>
                  {getStatusBadge()}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Ends {formatDate(market.endDate)}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4 dark:text-white">{market.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{market.description}</p>

              {/* Market Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t dark:border-gray-700">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">YES Pool</div>
                  <div className="flex items-center gap-1.5">
                    <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{market.yesPool.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">NO Pool</div>
                  <div className="flex items-center gap-1.5">
                    <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{market.noPool.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Volume</div>
                  <div className="flex items-center gap-1.5">
                    <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                    <div className="text-xl font-bold dark:text-white">{totalPool.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Creator</div>
                  <div className="text-sm font-mono dark:text-white">
                    {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
                  </div>
                </div>
              </div>
            </div>

            {/* Odds Bar */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Current Odds</h2>
              <div className="relative h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center"
                  style={{ width: `${yesPercentage}%` }}
                >
                  {yesPercentage > 20 && (
                    <span className="text-white font-bold">YES {yesPercentage.toFixed(1)}%</span>
                  )}
                </div>
                <div
                  className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 flex items-center justify-center"
                  style={{ width: `${noPercentage}%` }}
                >
                  {noPercentage > 20 && (
                    <span className="text-white font-bold">NO {noPercentage.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            </div>

            {/* Resolution Status / AI Oracle Info */}
            {market.status !== 0 ? (
              /* Resolved Market */
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">AI Resolution Complete</h2>
                    <p className="text-gray-600 dark:text-gray-400">This market has been resolved by AI oracle</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Outcome */}
                  <div className={`p-4 rounded-lg ${market.outcome === 1 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Final Outcome</div>
                    <div className={`text-3xl font-bold ${market.outcome === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {market.outcome === 1 ? 'YES' : 'NO'}
                    </div>
                  </div>

                  {/* AI Info */}
                  {market.resolverAiProvider && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Provider</div>
                        <div className="font-semibold dark:text-white">{market.resolverAiProvider}</div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Model</div>
                        <div className="font-semibold dark:text-white">{market.resolverAiModel}</div>
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning */}
                  {market.resolverAiReasoning && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">AI Reasoning</div>
                      <p className="text-gray-700 dark:text-gray-300">{market.resolverAiReasoning}</p>
                    </div>
                  )}

                  {/* Evidence Blob */}
                  {market.oracleEvidenceBlobId && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Evidence (Walrus)</div>
                      <code className="text-xs text-blue-600 dark:text-blue-400 break-all">{market.oracleEvidenceBlobId}</code>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Active Market - Resolution Conditions */
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Resolution Conditions</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📅</span>
                      <span className="font-semibold text-blue-800 dark:text-blue-200">Resolution Date</span>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">{formatDate(market.endDate)}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      {Date.now() < market.endDate
                        ? `${Math.ceil((market.endDate - Date.now()) / (1000 * 60 * 60 * 24))} days remaining`
                        : 'Resolution date has passed - ready to resolve!'
                      }
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🤖</span>
                      <span className="font-semibold text-purple-800 dark:text-purple-200">AI Oracle Resolution</span>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Anyone can trigger resolution by paying 0.001 USDC via x402 protocol.
                      AI (GPT, Gemini, Claude) will analyze data sources and determine the outcome.
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">⛓️</span>
                      <span className="font-semibold text-orange-800 dark:text-orange-200">On-Chain Verification</span>
                    </div>
                    <p className="text-orange-700 dark:text-orange-300 text-sm">
                      Resolution is recorded on SUI blockchain. Evidence is stored on Walrus for permanent verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trading Panel or Resolved Info */}
            {market.status === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm sticky top-24">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Place Your Bet</h3>

                {!account ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Connect wallet to bet</p>
                    <WalletButton />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4" />
                      <span className="text-sm font-bold dark:text-white">
                        {isUsdtLoading ? '...' : usdtBalance.toLocaleString()} USDT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedOutcome('yes')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedOutcome === 'yes'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                        }`}
                      >
                        <div className="font-bold text-green-600 dark:text-green-400">YES</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{yesPercentage.toFixed(0)}%</div>
                      </button>
                      <button
                        onClick={() => setSelectedOutcome('no')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedOutcome === 'no'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                        }`}
                      >
                        <div className="font-bold text-red-600 dark:text-red-400">NO</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{noPercentage.toFixed(0)}%</div>
                      </button>
                    </div>

                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      placeholder="Amount in USDT"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                    />

                    <button
                      onClick={handlePlaceBet}
                      disabled={!selectedOutcome || !betAmount}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold disabled:opacity-50"
                    >
                      Place Bet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-bold mb-4 dark:text-white">Market Closed</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This market has been resolved. Winners can claim their rewards.
                </p>
              </div>
            )}


            {/* Market Info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm">
              <h4 className="font-semibold mb-2 dark:text-white">Market Info</h4>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Market ID</span>
                  <span className="font-mono text-xs">{market.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Walrus Blob</span>
                  <span className="font-mono text-xs">{market.walrusMetadataBlobId.slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
