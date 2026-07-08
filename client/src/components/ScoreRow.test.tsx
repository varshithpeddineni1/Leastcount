import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreRow } from './ScoreRow';

describe('ScoreRow', () => {
  it('renders the player name and score', () => {
    render(<ScoreRow name="Priya" score={12} />);

    expect(screen.getByText('Priya')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
