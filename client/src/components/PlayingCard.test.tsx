import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayingCard } from './PlayingCard';

describe('PlayingCard', () => {
  it('renders a red face card for hearts', () => {
    render(<PlayingCard variant="face" rank="K" suit="hearts" />);

    const card = screen.getByLabelText('K of hearts');
    expect(card).toHaveClass('playing-card--red');
  });

  it('renders a black face card for spades', () => {
    render(<PlayingCard variant="face" rank="7" suit="spades" />);

    expect(screen.getByLabelText('7 of spades')).toHaveClass('playing-card--black');
  });

  it('renders a face-down back', () => {
    render(<PlayingCard variant="back" />);

    expect(screen.getByLabelText('Face-down card')).toHaveClass('playing-card--back');
  });

  it('renders a joker', () => {
    render(<PlayingCard variant="joker" />);

    expect(screen.getByLabelText('Joker')).toHaveClass('playing-card--joker');
  });
});
