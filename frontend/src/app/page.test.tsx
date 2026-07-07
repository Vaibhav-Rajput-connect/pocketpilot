import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

// Mock the auth provider hook
vi.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock Three.js scene to avoid WebGL errors in jsdom
vi.mock('@/components/three/HeroScene', () => ({
  HeroScene: () => <div data-testid="hero-scene-mock" />
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // Our home page has the word "PocketPilot"
    expect(screen.getAllByText(/PocketPilot/i)[0]).toBeInTheDocument();
  });
});
