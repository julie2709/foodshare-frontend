export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  pseudo: string;
}

export interface AuthResponse {
  token: string;
}