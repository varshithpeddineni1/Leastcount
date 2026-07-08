import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and defaults to the primary variant', () => {
    render(<Button>Start game</Button>);

    const button = screen.getByRole('button', { name: 'Start game' });
    expect(button).toHaveClass('btn--primary');
  });

  it('applies the requested variant', () => {
    render(<Button variant="danger">Leave room</Button>);

    expect(screen.getByRole('button', { name: 'Leave room' })).toHaveClass('btn--danger');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Declare</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Declare' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
