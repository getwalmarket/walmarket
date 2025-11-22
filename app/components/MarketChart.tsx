'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type TimeRange = '24h' | '7d' | '30d' | 'all';

interface MarketChartProps {
  marketId: string;
}

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

// Generate mock historical data for demonstration
const generateMockData = (days: number) => {
  const data = [];
  const now = Date.now();
  const baseYesPrice = 0.65;

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const date = new Date(timestamp);

    // Add some realistic variation
    const variation = Math.sin(i / 5) * 0.1 + Math.random() * 0.05;
    const yesPrice = Math.max(0.1, Math.min(0.9, baseYesPrice + variation));
    const noPrice = 1 - yesPrice;

    // Volume varies more
    const volume = Math.floor(1000 + Math.random() * 5000 + Math.sin(i / 3) * 2000);

    data.push({
      timestamp,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      yesPrice: parseFloat((yesPrice * 100).toFixed(1)),
      noPrice: parseFloat((noPrice * 100).toFixed(1)),
      volume,
    });
  }

  return data;
};

// Custom tooltip component (defined outside render for performance)
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-orange-300 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">YES:</span>
            <span className="text-sm font-bold text-green-600">
              {payload[0].value}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">NO:</span>
            <span className="text-sm font-bold text-red-600">
              {payload[1].value}%
            </span>
          </div>
          {payload[2] && (
            <div className="flex items-center gap-2 pt-1 border-t mt-1">
              <span className="text-xs text-gray-600">Volume:</span>
              <span className="text-sm font-bold text-gray-900">
                {payload[2].value.toLocaleString()} USDT
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function MarketChart({ marketId }: MarketChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Get data based on selected time range
  const getData = () => {
    switch (timeRange) {
      case '24h':
        return generateMockData(1);
      case '7d':
        return generateMockData(7);
      case '30d':
        return generateMockData(30);
      case 'all':
        return generateMockData(90);
      default:
        return generateMockData(7);
    }
  };

  const data = getData();

  // marketId will be used in future for fetching real historical data
  console.log('Market ID:', marketId);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Market History</h2>

        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-orange-50 border border-orange-200 rounded-lg p-1">
            {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                  timeRange === range
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-orange-700 hover:bg-orange-100'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                chartType === 'area'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                chartType === 'line'
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorYes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorNo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="yesPrice"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorYes)"
                name="YES"
              />
              <Area
                type="monotone"
                dataKey="noPrice"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorNo)"
                name="NO"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#9ca3af"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '14px', fontWeight: '600' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="yesPrice"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="YES"
              />
              <Line
                type="monotone"
                dataKey="noPrice"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 4 }}
                activeDot={{ r: 6 }}
                name="NO"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Avg YES</div>
          <div className="text-lg font-bold text-green-600">
            {(data.reduce((sum, d) => sum + d.yesPrice, 0) / data.length).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Avg NO</div>
          <div className="text-lg font-bold text-red-600">
            {(data.reduce((sum, d) => sum + d.noPrice, 0) / data.length).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Total Volume</div>
          <div className="text-lg font-bold text-gray-900">
            {(data.reduce((sum, d) => sum + d.volume, 0) / 1000).toFixed(1)}k
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Avg Daily</div>
          <div className="text-lg font-bold text-gray-900">
            {(data.reduce((sum, d) => sum + d.volume, 0) / data.length / 1000).toFixed(1)}k
          </div>
        </div>
      </div>
    </div>
  );
}
