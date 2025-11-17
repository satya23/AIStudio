import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../AuthContext';
import type { User } from '../../types';

const TestComponent = () => {
  const auth = useAuthContext();
  return (
    <div>
      <div data-testid="token">{auth.token || 'null'}</div>
      <div data-testid="user">{auth.user ? auth.user.email : 'null'}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
      <button onClick={auth.login.bind(null, 'test-token', { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() })}>
        Login
      </button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide default auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  it('should restore auth state from localStorage', () => {
    const storedAuth = {
      token: 'stored-token',
      user: { id: '1', email: 'stored@example.com', createdAt: new Date().toISOString() },
    };
    localStorage.setItem('ai-studio-auth', JSON.stringify(storedAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    expect(screen.getByTestId('user')).toHaveTextContent('stored@example.com');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorage.setItem('ai-studio-auth', 'invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  it('should update auth state when login is called', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText('Login');
    act(() => {
      loginButton.click();
    });

    expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
  });

  it('should save auth state to localStorage on login', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText('Login');
    act(() => {
      loginButton.click();
    });

    const stored = JSON.parse(localStorage.getItem('ai-studio-auth') || '{}');
    expect(stored.token).toBe('test-token');
    expect(stored.user.email).toBe('test@example.com');
  });

  it('should clear auth state when logout is called', () => {
    const storedAuth = {
      token: 'stored-token',
      user: { id: '1', email: 'stored@example.com', createdAt: new Date().toISOString() },
    };
    localStorage.setItem('ai-studio-auth', JSON.stringify(storedAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('token')).toHaveTextContent('null');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
  });

  it('should remove auth state from localStorage on logout', () => {
    const storedAuth = {
      token: 'stored-token',
      user: { id: '1', email: 'stored@example.com', createdAt: new Date().toISOString() },
    };
    localStorage.setItem('ai-studio-auth', JSON.stringify(storedAuth));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(localStorage.getItem('ai-studio-auth')).toBeNull();
  });

  it('should throw error when useAuthContext is called outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('AuthContext accessed outside provider');

    consoleSpy.mockRestore();
  });

  it('should update localStorage when auth state changes', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginButton = screen.getByText('Login');
    act(() => {
      loginButton.click();
    });

    expect(localStorage.getItem('ai-studio-auth')).toBeTruthy();

    const logoutButton = screen.getByText('Logout');
    act(() => {
      logoutButton.click();
    });

    expect(localStorage.getItem('ai-studio-auth')).toBeNull();
  });
});

