import { useState } from 'react';
import { getStoredTheme, getSystemTheme, setStoredTheme, type Theme } from '../theme';
import { Button } from './Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setStoredTheme(next);
    setTheme(next);
  }

  return (
    <Button
      variant="secondary"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      data-testid="theme-toggle"
    >
      {theme === 'dark' ? 'Dark' : 'Light'} mode
    </Button>
  );
}
