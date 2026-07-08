import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Gallery } from './Gallery';

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe('Gallery', () => {
  it('renders every shared component section', () => {
    render(<Gallery />);

    expect(screen.getByText('Buttons')).toBeInTheDocument();
    expect(screen.getByText('Badges')).toBeInTheDocument();
    expect(screen.getByText('Player avatars')).toBeInTheDocument();
    expect(screen.getByText('Playing cards')).toBeInTheDocument();
    expect(screen.getByText('Scoreboard')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });
});
