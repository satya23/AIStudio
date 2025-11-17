import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthForm } from '../AuthForm';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

vi.mock('../../hooks/useAuth');
vi.mock('../../services/api');
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockApi = api as {
  login: ReturnType<typeof vi.fn>;
  signup: ReturnType<typeof vi.fn>;
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AuthForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  describe('Login mode', () => {
    it('should render login form', () => {
      renderWithRouter(<AuthForm mode="login" />);
      expect(screen.getByLabelText(/log in form/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('should submit login form with valid credentials', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      };

      mockApi.login.mockResolvedValue(mockResponse);

      renderWithRouter(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(mockApi.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockLogin).toHaveBeenCalledWith(mockResponse.token, mockResponse.user);
        expect(mockNavigate).toHaveBeenCalledWith('/studio');
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';

      mockApi.login.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });

    it('should disable submit button while processing', async () => {
      const user = userEvent.setup();
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockApi.login.mockReturnValue(pendingPromise);

      renderWithRouter(<AuthForm mode="login" />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      const submitButton = screen.getByRole('button', { name: /log in/i });

      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Processing…');

      resolvePromise!({
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      });
    });
  });

  describe('Signup mode', () => {
    it('should render signup form', () => {
      renderWithRouter(<AuthForm mode="signup" />);
      expect(screen.getByLabelText(/create account form/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should submit signup form with valid data', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', email: 'new@example.com', createdAt: new Date().toISOString() },
      };

      mockApi.signup.mockResolvedValue(mockResponse);

      renderWithRouter(<AuthForm mode="signup" />);

      await user.type(screen.getByLabelText(/email/i), 'new@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(mockApi.signup).toHaveBeenCalledWith({
          email: 'new@example.com',
          password: 'password123',
        });
        expect(mockLogin).toHaveBeenCalledWith(mockResponse.token, mockResponse.user);
        expect(mockNavigate).toHaveBeenCalledWith('/studio');
      });
    });

    it('should display error message on signup failure', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already registered';

      mockApi.signup.mockRejectedValue(new Error(errorMessage));

      renderWithRouter(<AuthForm mode="signup" />);

      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
      });
    });
  });

  it('should clear error message on new submission', async () => {
    const user = userEvent.setup();

    mockApi.login.mockRejectedValueOnce(new Error('First error')).mockResolvedValueOnce({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
    });

    renderWithRouter(<AuthForm mode="login" />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('First error');
    });

    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'correctpassword');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

