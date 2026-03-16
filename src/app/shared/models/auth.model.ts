// Ce que le formulaire login envoie
export interface LoginPayload {
  email: string;
  password: string;
}

// Ce que le formulaire inscription envoie
export interface RegisterPayload {
  email: string;
  password: string;
  pseudo: string;
  postalCode: string;
}

// Ce que le backend renvoie après login
export interface AuthResponse {
  token: string;
}

// Représentation d'un utilisateur reçu depuis l'API
export interface User {
  id: number;
  email: string;
  pseudo: string;
  city: string;
  postalCode: string;
  roles: string[];
  createdAt: string;
}