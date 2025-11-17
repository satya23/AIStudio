import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthContext } from '../../context/AuthContext';

vi.mock('../../context/AuthContext');

describe('useAuth', () => {
  it('should return result from useAuthContext', () => {
    const mockAuthContext = {
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    };

    vi.mocked(useAuthContext).mockReturnValue(mockAuthContext);

    const { result } = renderHook(() => useAuth());

    expect(result.current).toEqual(mockAuthContext);
    expect(useAuthContext).toHaveBeenCalled();
  });
});

