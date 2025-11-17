import type { AuthResponse, Generation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const buildHeaders = (token?: string | null, extra?: HeadersInit) => {
  const headers = new Headers(extra);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  const payload = contentType?.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message ?? 'Request failed';
    const error = new Error(message);
    throw error;
  }

  return payload;
};

export const api = {
  baseUrl: API_BASE_URL,

  signup(body: { email: string; password: string }) {
    return fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse) as Promise<AuthResponse>;
  },

  login(body: { email: string; password: string }) {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(handleResponse) as Promise<AuthResponse>;
  },

  fetchGenerations(token: string, limit = 5) {
    return fetch(`${API_BASE_URL}/generations?limit=${limit}`, {
      headers: buildHeaders(token),
    })
      .then(handleResponse)
      .then((data) => data.items as Generation[]);
  },

  createGeneration({
    token,
    prompt,
    style,
    imageFile,
    signal,
  }: {
    token: string;
    prompt: string;
    style: string;
    imageFile: File;
    signal?: AbortSignal;
  }) {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style);
    formData.append('image', imageFile);

    return fetch(`${API_BASE_URL}/generations`, {
      method: 'POST',
      body: formData,
      headers: buildHeaders(token),
      signal,
    }).then(handleResponse) as Promise<Generation>;
  },
};

