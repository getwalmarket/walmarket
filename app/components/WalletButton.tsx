'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function WalletButton() {
  const account = useCurrentAccount();

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {account && (
        <div className="hidden sm:block text-xs font-[family-name:var(--font-press-start)] text-orange-600 bg-orange-50 px-3 py-2 border-2 border-orange-400 whitespace-nowrap">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
      )}
      <ConnectButton
        className="px-3 sm:px-5 py-1.5 sm:py-2 bg-orange-500 text-white text-[0.625rem] sm:text-xs font-[family-name:var(--font-press-start)] hover:bg-orange-600 transition-all border-2 sm:border-3 border-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] sm:hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[1.5px] sm:hover:translate-y-[1.5px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] sm:active:translate-x-[3px] sm:active:translate-y-[3px] whitespace-nowrap"
      />
    </div>
  );
}
