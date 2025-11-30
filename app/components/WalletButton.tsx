'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image';
import { useUSDTBalance } from '../hooks/useUSDTBalance';

export function WalletButton() {
  const account = useCurrentAccount();
  const { balance, isLoading } = useUSDTBalance();

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {account && (
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 border-2 border-orange-400 dark:border-orange-500 rounded-lg shadow-sm">
          <div className="flex items-center gap-1.5">
            <Image src="/usdt.png" alt="USDT" width={20} height={20} className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {isLoading ? '...' : balance.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-4 w-px bg-orange-300 dark:bg-orange-500" />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {account.address.slice(0, 4)}...{account.address.slice(-4)}
          </span>
        </div>
      )}
      <ConnectButton
        className="px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-500 text-white text-[0.625rem] sm:text-xs font-[family-name:var(--font-press-start)] hover:bg-orange-600 transition-all border-2 sm:border-3 border-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] sm:hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[1.5px] sm:hover:translate-y-[1.5px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] sm:active:translate-x-[3px] sm:active:translate-y-[3px] whitespace-nowrap"
      />
    </div>
  );
}
