export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthState = {
  token: string | null;
  user: User | null;
};

export type AuthContextShape = {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

export type Generation = {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  createdAt: string;
  status: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

