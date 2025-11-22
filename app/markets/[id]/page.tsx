'use client';

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "../../components/Header";
import { WalletButton } from "../../components/WalletButton";
import { Footer } from "../../components/Footer";
import { MarketChart } from "../../components/MarketChart";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useUSDTBalance } from "../../hooks/useUSDTBalance";
import { Transaction } from "@mysten/sui/transactions";

// Mock data - same as markets page for consistency
const MOCK_MARKETS = [
  {
    id: '1',
    title: 'Will Bitcoin reach $150,000 by end of 2025?',
    description: 'Market resolves based on CoinGecko closing price on December 31, 2025',
    longDescription: 'This market will resolve to YES if Bitcoin (BTC) reaches or exceeds $150,000 USD on CoinGecko at any point before 11:59 PM UTC on December 31, 2025. The resolution will be based on the highest price recorded during this period.',
    category: 'Crypto',
    totalVolume: '45,200 USDT',
    yesPrice: 0.65,
    noPrice: 0.35,
    endDate: '2025-12-31',
    participants: 1247,
    createdBy: '0x1234...5678',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    title: 'Will Ethereum complete the merge to Proof of Stake by Q2 2025?',
    description: 'Market resolves when official Ethereum Foundation confirms completion',
    longDescription: 'This prediction market focuses on whether Ethereum will successfully complete its transition to Proof of Stake (PoS) consensus mechanism by the end of Q2 2025. Resolution requires official confirmation from the Ethereum Foundation.',
    category: 'Crypto',
    totalVolume: '32,100 USDT',
    yesPrice: 0.82,
    noPrice: 0.18,
    endDate: '2025-06-30',
    participants: 892,
    createdBy: '0xabcd...efgh',
    createdAt: '2025-01-10',
  },
  {
    id: '3',
    title: 'Will AI-generated content exceed 50% of web content by 2026?',
    description: 'Based on analysis from major web analytics providers',
    longDescription: 'This market will resolve based on comprehensive studies from leading web analytics providers (e.g., SimilarWeb, Alexa) that measure the proportion of AI-generated content on the public web.',
    category: 'Technology',
    totalVolume: '28,900 USDT',
    yesPrice: 0.58,
    noPrice: 0.42,
    endDate: '2026-01-01',
    participants: 654,
    createdBy: '0x9876...5432',
    createdAt: '2025-01-20',
  },
  {
    id: '4',
    title: 'Will SUI TVL exceed $5B in 2025?',
    description: 'Total Value Locked across SUI ecosystem as reported by DefiLlama',
    longDescription: 'This market tracks whether the SUI blockchain ecosystem will achieve a Total Value Locked (TVL) of $5 billion or more by the end of 2025, as measured by DefiLlama.',
    category: 'DeFi',
    totalVolume: '51,300 USDT',
    yesPrice: 0.71,
    noPrice: 0.29,
    endDate: '2025-12-31',
    participants: 1532,
    createdBy: '0xdef0...1234',
    createdAt: '2025-01-05',
  },
  {
    id: '5',
    title: 'Will any country adopt Bitcoin as legal tender in 2025?',
    description: 'Market resolves YES if official government announcement is made',
    longDescription: 'This market will resolve to YES if any sovereign nation officially adopts Bitcoin as legal tender in 2025, following El Salvador\'s example. The adoption must be confirmed through official government channels.',
    category: 'Politics',
    totalVolume: '19,400 USDT',
    yesPrice: 0.42,
    noPrice: 0.58,
    endDate: '2025-12-31',
    participants: 478,
    createdBy: '0xfed9...8765',
    createdAt: '2025-01-12',
  },
  {
    id: '6',
    title: 'Will Walrus storage exceed 1PB of data by end of 2025?',
    description: 'Based on official Walrus network statistics',
    longDescription: 'This market predicts whether the Walrus decentralized storage network will store more than 1 Petabyte (1PB) of data by December 31, 2025, based on official network statistics.',
    category: 'Infrastructure',
    totalVolume: '15,700 USDT',
    yesPrice: 0.55,
    noPrice: 0.45,
    endDate: '2025-12-31',
    participants: 321,
    createdBy: '0x3141...5926',
    createdAt: '2025-01-18',
  },
];

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const account = useCurrentAccount();
  const { balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useUSDTBalance();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no' | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const market = MOCK_MARKETS.find(m => m.id === id);

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Market Not Found</h1>
          <Link href="/markets" className="text-blue-600 hover:underline">
            Return to Markets
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceBet = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }
    if (!selectedOutcome || !betAmount) {
      alert('Please select an outcome and enter an amount');
      return;
    }

    try {
      setIsPlacingBet(true);

      // Create a demo transaction for testing wallet signature and execution
      // In production, this would call the smart contract's place_bet function with USDT
      const tx = new Transaction();

      // Demo transaction: Transfer 0.001 SUI to self (minimal transaction for testing)
      // This simulates the wallet signature and execution flow
      const [coin] = tx.splitCoins(tx.gas, [1_000_000]); // 0.001 SUI
      tx.transferObjects([coin], account.address);

      // In production, this would be replaced with actual USDT bet transaction:
      // tx.moveCall({
      //   target: `${PACKAGE_ID}::market::place_bet`,
      //   arguments: [
      //     tx.object(MARKET_REGISTRY_ID),
      //     tx.pure.string(market.id),
      //     tx.pure.bool(selectedOutcome === 'yes'),
      //     tx.pure.u64(parseFloat(betAmount) * 1_000_000), // USDT amount with 6 decimals
      //   ],
      // });

      // Request wallet signature and execute transaction
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log('Transaction executed successfully:', result);
            alert(`✅ Bet placed successfully!\n\nAmount: ${betAmount} USDT\nOutcome: ${selectedOutcome.toUpperCase()}\n\n📝 Demo Mode: Test transaction executed.\nIn production, ${betAmount} USDT would be transferred to the smart contract.\n\nDigest: ${result.digest.substring(0, 20)}...`);

            // Refresh balance after transaction
            setTimeout(() => refetchBalance(), 2000);

            // Reset form
            setBetAmount('');
            setSelectedOutcome(null);
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            alert(`❌ Transaction failed: ${error.message || 'Unknown error'}`);
          },
        }
      );
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPlacingBet(false);
    }
  };

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
          <span className="text-gray-600">{market.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Header */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {market.category}
                </span>
                <span className="text-sm text-gray-500">
                  Ends {new Date(market.endDate).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{market.title}</h1>
              <p className="text-gray-600 mb-6">{market.longDescription}</p>

              {/* Market Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Volume</div>
                  <div className="flex items-center gap-1.5">
                    <Image src="/usdt.png" alt="USDT" width={24} height={24} className="w-6 h-6" />
                    <div className="text-xl font-bold">{market.totalVolume.replace(' USDT', '')}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Participants</div>
                  <div className="text-xl font-bold">{market.participants.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Created</div>
                  <div className="text-xl font-bold">
                    {new Date(market.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Odds */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Current Odds</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                  <div className="text-lg font-medium text-gray-700 mb-2">YES</div>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {(market.yesPrice * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4" />
                    <span>{market.yesPrice.toFixed(2)} per share</span>
                  </div>
                </div>
                <div className="border-2 border-red-200 rounded-xl p-6 bg-red-50">
                  <div className="text-lg font-medium text-gray-700 mb-2">NO</div>
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {(market.noPrice * 100).toFixed(1)}%
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4" />
                    <span>{market.noPrice.toFixed(2)} per share</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Chart */}
            <MarketChart marketId={market.id} />

            {/* AI Oracle Resolution */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold mb-4">AI Oracle Resolution</h2>
              <div className="space-y-4">
                <div className="text-gray-700">
                  <p className="mb-4">{market.description}</p>
                  <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-600 text-lg">ℹ️</span>
                    <p>
                      This market will be resolved using our <strong>Verifiable AI Oracle</strong> powered by Nautilus TEE and GPT-5.
                    </p>
                  </div>
                </div>

                {/* AI Oracle Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <div className="font-semibold text-purple-900 text-sm">Nautilus TEE</div>
                      <p className="text-xs text-purple-700 mt-1">
                        AI runs in secure enclaves with cryptographic attestation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-semibold text-green-900 text-sm">GPT-5 Oracle</div>
                      <p className="text-xs text-green-700 mt-1">
                        Multi-source data verification with cryptographic proofs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <span className="text-2xl">🌊</span>
                    <div>
                      <div className="font-semibold text-orange-900 text-sm">Walrus Storage</div>
                      <p className="text-xs text-orange-700 mt-1">
                        Permanent evidence bundles (input, output, reasoning)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-2xl">⛓️</span>
                    <div>
                      <div className="font-semibold text-blue-900 text-sm">On-Chain Verification</div>
                      <p className="text-xs text-blue-700 mt-1">
                        SUI smart contracts validate TEE attestations
                      </p>
                    </div>
                  </div>
                </div>

                {/* How it Works Link */}
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-1">Want to learn how it works?</div>
                      <p className="text-sm text-gray-600">
                        See the complete AI oracle verification flow with Nautilus TEE, Walrus, and SUI
                      </p>
                    </div>
                    <Link
                      href="/how-it-works"
                      className="ml-4 px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
                    >
                      Learn More →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">Place Your Bet</h3>
                </div>
                {account && (
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg w-full">
                    <span className="text-xs text-gray-600 whitespace-nowrap">Balance:</span>
                    <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-900 break-all">
                      {isBalanceLoading ? '...' : balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">USDT</span>
                  </div>
                )}
              </div>

              {!account ? (
                <div className="space-y-6">
                  {/* Market Preview */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">🎯</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to bet?</h3>
                      <p className="text-sm text-gray-600">Connect your wallet to place bets on this market</p>
                    </div>

                    {/* Current Odds Preview */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/80 border border-green-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">YES</div>
                        <div className="text-2xl font-bold text-green-600">
                          {(market.yesPrice * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-white/80 border border-red-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-gray-600 mb-1">NO</div>
                        <div className="text-2xl font-bold text-red-600">
                          {(market.noPrice * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <div className="flex justify-center">
                      <WalletButton />
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-gray-900">Trade with USDT</div>
                        <div className="text-gray-600">Use stablecoins for predictable value</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-lg">⚡</span>
                      <div>
                        <div className="font-semibold text-gray-900">Instant Transactions</div>
                        <div className="text-gray-600">Fast execution on SUI blockchain</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="text-lg">🔒</span>
                      <div>
                        <div className="font-semibold text-gray-900">Secure & Verifiable</div>
                        <div className="text-gray-600">AI oracle with TEE attestation</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Outcome Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Outcome
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedOutcome('yes')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedOutcome === 'yes'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="font-bold text-green-600">YES</div>
                        <div className="text-sm text-gray-600">{(market.yesPrice * 100).toFixed(0)}%</div>
                      </button>
                      <button
                        onClick={() => setSelectedOutcome('no')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedOutcome === 'no'
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="font-bold text-red-600">NO</div>
                        <div className="text-sm text-gray-600">{(market.noPrice * 100).toFixed(0)}%</div>
                      </button>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                      <span>Amount</span>
                      <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4" />
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    {/* Quick Amount Selection */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <button
                        onClick={() => {
                          const amount = balance * 0.1;
                          setBetAmount(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(/\.?0+$/, ''));
                        }}
                        className="px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        10%
                      </button>
                      <button
                        onClick={() => {
                          const amount = balance * 0.25;
                          setBetAmount(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(/\.?0+$/, ''));
                        }}
                        className="px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        25%
                      </button>
                      <button
                        onClick={() => {
                          const amount = balance * 0.5;
                          setBetAmount(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(/\.?0+$/, ''));
                        }}
                        className="px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => {
                          const amount = balance;
                          setBetAmount(amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2).replace(/\.?0+$/, ''));
                        }}
                        className="px-3 py-2 text-xs font-medium text-white bg-orange-500 border border-orange-600 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        MAX
                      </button>
                    </div>

                    {betAmount && parseFloat(betAmount) > balance && (
                      <p className="text-xs text-red-600 mt-2">Insufficient balance</p>
                    )}
                  </div>

                  {/* Potential Return */}
                  {betAmount && selectedOutcome && parseFloat(betAmount) > 0 && (
                    (() => {
                      const bet = parseFloat(betAmount);
                      const price = selectedOutcome === 'yes' ? market.yesPrice : market.noPrice;
                      // Shares you get = bet / price
                      const shares = bet / price;
                      // If you win, each share is worth 1 USDT
                      const potentialPayout = shares * 1;
                      // Profit = payout - original bet
                      const profit = potentialPayout - bet;
                      const profitPercent = (profit / bet) * 100;

                      return (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-5 rounded-lg space-y-3">
                          {/* Bet Amount */}
                          <div className="flex justify-between items-center pb-3 border-b border-green-200">
                            <span className="text-sm text-gray-600">Bet amount</span>
                            <div className="flex items-center gap-1.5">
                              <Image src="/usdt.png" alt="USDT" width={18} height={18} className="w-[18px] h-[18px]" />
                              <span className="text-base font-bold text-gray-900">
                                {bet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* Profit Display - Most Important */}
                          <div className="flex justify-between items-center py-2 bg-green-100/50 -mx-2 px-2 rounded">
                            <span className="text-base font-bold text-green-800">Profit if you win</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-2xl font-bold text-green-600">
                                +{profit.toFixed(2)}
                              </span>
                              <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Total Payout */}
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-sm text-gray-600">Total payout</span>
                            <div className="flex items-center gap-1.5">
                              <Image src="/usdt.png" alt="USDT" width={16} height={16} className="w-4 h-4" />
                              <span className="text-base font-semibold text-gray-900">
                                {potentialPayout.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Return Percentage */}
                          <div className="text-center pt-2 border-t border-green-200">
                            <span className="text-xs font-medium text-green-700">
                              {profitPercent.toFixed(1)}% return on investment
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Place Bet Button */}
                  <button
                    onClick={handlePlaceBet}
                    disabled={!selectedOutcome || !betAmount || parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0 || isPlacingBet}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isPlacingBet
                      ? 'Signing Transaction...'
                      : parseFloat(betAmount) > balance
                        ? 'Insufficient Balance'
                        : 'Place Bet'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By placing a bet, you agree to the market resolution criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
