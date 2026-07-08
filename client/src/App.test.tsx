import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the placeholder message', () => {
    render(<App />);

    expect(screen.getByTestId('placeholder-message')).toBeInTheDocument();
  });
});
