import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeToggle', () => {
  it('starts in light mode when the OS has no dark preference', () => {
    render(<ThemeToggle />);

    expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Light mode');
  });

  it('toggles to dark mode and persists the choice', async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByTestId('theme-toggle'));

    expect(screen.getByTestId('theme-toggle')).toHaveTextContent('Dark mode');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('least-count-theme')).toBe('dark');
  });
});
