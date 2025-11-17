import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../api';

describe('api', () => {
  const originalFetch = global.fetch;
  const originalEnv = import.meta.env;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.stubEnv('VITE_API_URL', 'http://localhost:4000');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  describe('signup', () => {
    it('should make POST request to signup endpoint', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await api.signup({ email: 'test@example.com', password: 'password123' });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when request fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: 'Email already registered' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(api.signup({ email: 'test@example.com', password: 'password123' })).rejects.toThrow(
        'Email already registered',
      );
    });
  });

  describe('login', () => {
    it('should make POST request to login endpoint', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: '1', email: 'test@example.com', createdAt: new Date().toISOString() },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await api.login({ email: 'test@example.com', password: 'password123' });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when credentials are invalid', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(api.login({ email: 'test@example.com', password: 'wrongpassword' })).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('fetchGenerations', () => {
    it('should make GET request to generations endpoint with token', async () => {
      const mockGenerations = [
        {
          id: '1',
          prompt: 'Test prompt',
          style: 'Minimalist',
          imageUrl: '/uploads/img1.png',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockGenerations }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await api.fetchGenerations('test-token', 5);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe('http://localhost:4000/generations?limit=5');
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-token');
      expect(result).toEqual(mockGenerations);
    });

    it('should use default limit when not provided', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await api.fetchGenerations('test-token');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/generations?limit=5', expect.any(Object));
    });

    it('should throw error when request fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(api.fetchGenerations('invalid-token')).rejects.toThrow('Unauthorized');
    });
  });

  describe('createGeneration', () => {
    it('should make POST request with FormData', async () => {
      const mockGeneration = {
        id: '1',
        prompt: 'Test prompt',
        style: 'Minimalist',
        imageUrl: '/uploads/img1.png',
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGeneration,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const result = await api.createGeneration({
        token: 'test-token',
        prompt: 'Test prompt',
        style: 'Minimalist',
        imageFile: file,
      });

      // Verify FormData was used
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe('http://localhost:4000/generations');
      expect(fetchCall[1]?.method).toBe('POST');
      expect(fetchCall[1]?.body).toBeInstanceOf(FormData);
      
      const formData = fetchCall[1]?.body as FormData;
      expect(formData.get('prompt')).toBe('Test prompt');
      expect(formData.get('style')).toBe('Minimalist');
      expect(formData.get('image')).toBe(file);
      
      // Check headers
      const headers = fetchCall[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer test-token');

      expect(result).toEqual(mockGeneration);
    });

    it('should include AbortSignal when provided', async () => {
      const abortController = new AbortController();
      const signal = abortController.signal;

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '1',
          prompt: 'Test',
          style: 'Minimalist',
          imageUrl: '/uploads/img.png',
          createdAt: new Date().toISOString(),
          status: 'completed',
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      await api.createGeneration({
        token: 'test-token',
        prompt: 'Test prompt',
        style: 'Minimalist',
        imageFile: file,
        signal,
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[0]).toBe('http://localhost:4000/generations');
      expect(fetchCall[1]?.signal).toBe(signal);
    });

    it('should throw error when request fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: 'Model overloaded' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const file = new File(['test'], 'test.png', { type: 'image/png' });
      await expect(
        api.createGeneration({
          token: 'test-token',
          prompt: 'Test prompt',
          style: 'Minimalist',
          imageFile: file,
        }),
      ).rejects.toThrow('Model overloaded');
    });
  });

  describe('baseUrl', () => {
    it('should have baseUrl property', () => {
      expect(api.baseUrl).toBeDefined();
      expect(typeof api.baseUrl).toBe('string');
    });
  });
});

