import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyTheme, getStoredTheme, getSystemTheme, initTheme, setStoredTheme } from './theme';

function mockMatchMedia(matchesDark: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' && matchesDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('theme', () => {
  it('getStoredTheme returns null when nothing is stored', () => {
    expect(getStoredTheme()).toBeNull();
  });

  it('getStoredTheme ignores invalid stored values', () => {
    localStorage.setItem('least-count-theme', 'not-a-theme');
    expect(getStoredTheme()).toBeNull();
  });

  it('getSystemTheme reflects prefers-color-scheme: dark', () => {
    mockMatchMedia(true);
    expect(getSystemTheme()).toBe('dark');
  });

  it('getSystemTheme defaults to light when OS does not prefer dark', () => {
    mockMatchMedia(false);
    expect(getSystemTheme()).toBe('light');
  });

  it('applyTheme sets the data-theme attribute on the root element', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setStoredTheme persists and applies the theme', () => {
    setStoredTheme('dark');
    expect(localStorage.getItem('least-count-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('initTheme prefers a stored theme over the system theme', () => {
    mockMatchMedia(true);
    localStorage.setItem('least-count-theme', 'light');

    expect(initTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('initTheme falls back to the system theme when nothing is stored', () => {
    mockMatchMedia(true);

    expect(initTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
