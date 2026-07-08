import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders its children inside a panel surface', () => {
    render(<Panel data-testid="panel">Lobby roster</Panel>);

    const panel = screen.getByTestId('panel');
    expect(panel).toHaveClass('panel');
    expect(panel).toHaveTextContent('Lobby roster');
  });
});
