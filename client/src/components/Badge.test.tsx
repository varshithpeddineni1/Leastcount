import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('defaults to the primary variant', () => {
    render(<Badge>Host</Badge>);

    expect(screen.getByText('Host')).toHaveClass('badge--primary');
  });

  it('applies the requested variant', () => {
    render(<Badge variant="danger">Eliminated</Badge>);

    expect(screen.getByText('Eliminated')).toHaveClass('badge--danger');
  });
});
