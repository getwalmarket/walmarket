'use client';

import Link from "next/link";
import Image from "next/image";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

// Mock data for demonstration - will be replaced with actual blockchain data
const MOCK_MARKETS = [
  {
    id: '1',
    title: 'Will Bitcoin reach $150,000 by end of 2025?',
    description: 'Market resolves based on CoinGecko closing price on December 31, 2025',
    category: 'Crypto',
    totalVolume: '45,200 USDT',
    yesPrice: 0.65,
    noPrice: 0.35,
    endDate: '2025-12-31',
    participants: 1247,
  },
  {
    id: '2',
    title: 'Will Ethereum complete the merge to Proof of Stake by Q2 2025?',
    description: 'Market resolves when official Ethereum Foundation confirms completion',
    category: 'Crypto',
    totalVolume: '32,100 USDT',
    yesPrice: 0.82,
    noPrice: 0.18,
    endDate: '2025-06-30',
    participants: 892,
  },
  {
    id: '3',
    title: 'Will AI-generated content exceed 50% of web content by 2026?',
    description: 'Based on analysis from major web analytics providers',
    category: 'Technology',
    totalVolume: '28,900 USDT',
    yesPrice: 0.58,
    noPrice: 0.42,
    endDate: '2026-01-01',
    participants: 654,
  },
  {
    id: '4',
    title: 'Will SUI TVL exceed $5B in 2025?',
    description: 'Total Value Locked across SUI ecosystem as reported by DefiLlama',
    category: 'DeFi',
    totalVolume: '51,300 USDT',
    yesPrice: 0.71,
    noPrice: 0.29,
    endDate: '2025-12-31',
    participants: 1532,
  },
  {
    id: '5',
    title: 'Will any country adopt Bitcoin as legal tender in 2025?',
    description: 'Market resolves YES if official government announcement is made',
    category: 'Politics',
    totalVolume: '19,400 USDT',
    yesPrice: 0.42,
    noPrice: 0.58,
    endDate: '2025-12-31',
    participants: 478,
  },
  {
    id: '6',
    title: 'Will Walrus storage exceed 1PB of data by end of 2025?',
    description: 'Based on official Walrus network statistics',
    category: 'Infrastructure',
    totalVolume: '15,700 USDT',
    yesPrice: 0.55,
    noPrice: 0.45,
    endDate: '2025-12-31',
    participants: 321,
  },
];

const CATEGORIES = ['All', 'Crypto', 'Technology', 'DeFi', 'Politics', 'Infrastructure'];

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4">Prediction Markets</h2>
          <p className="text-gray-600 text-lg">
            Trade on the outcome of real-world events. The wisdom of crowds meets blockchain transparency.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                category === 'All'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">Total Markets</div>
            <div className="text-3xl font-bold text-gray-900">{MOCK_MARKETS.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">Total Volume</div>
            <div className="flex items-center gap-2">
              <Image src="/usdt.png" alt="USDT" width={32} height={32} className="w-8 h-8" />
              <div className="text-3xl font-bold text-gray-900">192,700</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-orange-200">
            <div className="text-sm text-gray-600 mb-1">Active Traders</div>
            <div className="text-3xl font-bold text-gray-900">5,124</div>
          </div>
        </div>

        {/* Markets Grid */}
        <div className="grid gap-6">
          {MOCK_MARKETS.map((market) => (
            <Link
              key={market.id}
              href={`/markets/${market.id}`}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-orange-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                      {market.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {market.participants.toLocaleString()} participants
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{market.title}</h3>
                  <p className="text-gray-600">{market.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-6">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">YES</div>
                      <div className="text-2xl font-bold text-green-600">
                        {(market.yesPrice * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">NO</div>
                      <div className="text-2xl font-bold text-red-600">
                        {(market.noPrice * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Volume</div>
                      <div className="flex items-center gap-1.5">
                        <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
                        <div className="text-lg font-semibold text-gray-900">
                          {market.totalVolume.replace(' USDT', '')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Ends</div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(market.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Create Market CTA */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 p-8 rounded-xl text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Have a question for the crowd?</h3>
          <p className="mb-6 opacity-90">Create your own prediction market and let the collective intelligence decide.</p>
          <button className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Create Market
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
