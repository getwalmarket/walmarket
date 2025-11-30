'use client';

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b-4 border-orange-400 dark:border-orange-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_rgba(251,146,60,0.3)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
          <Link href="/" className="flex-shrink min-w-0">
            <Image
              src="/no-bg-txt.png"
              alt="Walmarket Logo"
              width={1024}
              height={256}
              priority
              className="h-14 sm:h-16 md:h-20 w-auto cursor-pointer"
            />
          </Link>
          <div className="hidden xs:block px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[0.5rem] sm:text-xs font-[family-name:var(--font-press-start)] border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] whitespace-nowrap">
            TESTNET
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/how-it-works"
            className="px-3 py-2 text-[0.6rem] font-[family-name:var(--font-press-start)] text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            HOW IT WORKS
          </Link>
          <Link
            href="/ai-oracle-validator"
            className="px-3 py-2 text-[0.6rem] font-[family-name:var(--font-press-start)] text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            VALIDATOR
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
