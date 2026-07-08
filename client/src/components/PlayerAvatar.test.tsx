import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerAvatar } from './PlayerAvatar';

describe('PlayerAvatar', () => {
  it('renders the first two letters of the nickname, upper-cased', () => {
    render(<PlayerAvatar nickname="priya" seatIndex={0} />);

    expect(screen.getByLabelText('priya')).toHaveTextContent('PR');
  });

  it('derives a distinct hue per seat', () => {
    render(<PlayerAvatar nickname="Rae" seatIndex={2} />);

    const avatar = screen.getByLabelText('Rae');
    expect(avatar.style.getPropertyValue('--avatar-hue')).toBe('90');
  });
});
