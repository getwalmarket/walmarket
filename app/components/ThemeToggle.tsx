'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This is necessary to avoid hydration mismatch with next-themes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
        aria-label="Toggle theme"
      >
        <span className="text-lg">🌙</span>
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return '💻';
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getLabel = () => {
    if (theme === 'system') {
      return 'System theme';
    }
    return resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode';
  };

  return (
    <button
      onClick={cycleTheme}
      className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-2 border-orange-400 dark:border-orange-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-[2px_2px_0px_0px_rgba(251,146,60,0.4)]"
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="text-lg">{getIcon()}</span>
    </button>
  );
}
