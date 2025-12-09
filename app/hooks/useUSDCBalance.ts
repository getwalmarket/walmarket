import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';

const USDC_TYPE = process.env.NEXT_PUBLIC_USDC_TYPE ||
  '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC';

export function useUSDCBalance() {
  const account = useCurrentAccount();

  const { data, isLoading, error, refetch } = useSuiClientQuery(
    'getBalance',
    {
      owner: account?.address || '',
      coinType: USDC_TYPE,
    },
    {
      enabled: !!account?.address,
      refetchInterval: 5000, // Refetch every 5 seconds
    }
  );

  // Convert balance from smallest unit (6 decimals) to USDC
  const balance = data?.totalBalance ? Number(data.totalBalance) / 1_000_000 : 0;

  return {
    balance,
    rawBalance: data?.totalBalance || '0',
    isLoading,
    error,
    refetch,
  };
}
