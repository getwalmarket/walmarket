'use client';

import Link from "next/link";
import Image from "next/image";
import { WalletButton } from "./WalletButton";

export function Header() {
  return (
    <header className="border-b-4 border-orange-400 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-[0_4px_0px_0px_rgba(251,146,60,0.3)]">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Image
              src="/no-bg-txt.png"
              alt="Walmarket Logo"
              width={1024}
              height={576}
              priority
              className="h-16 md:h-20 w-auto cursor-pointer"
            />
          </Link>
          <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-[family-name:var(--font-press-start)] border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
            TESTNET
          </div>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
