// Interface pour un Listing reçu dpuis l'API
export interface ListingPhoto {
  id: number;
  url: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string | null;
  category: string;
  quantity: string | null;
  expiryDate: string | null;
  city: string | null;
  postalCode: string;
  pickupInfo: string | null;
  status: 'DISPONIBLE' | 'RESERVEE' | 'DONNEE';
  createdAt: string;
  listingPhotos: ListingPhoto[];
}

// Données envoyés par l formulaire
export interface CreateListingPayload {
  title: string;
  category: string;
  postalCode: string;
  description?: string;
  quantity?: string;
  expiryDate?: string;
  city?: string;
  pickupInfo?: string;
  photo: File;
}

// Permet de préparer la modification d'un don plus tard
export interface UpdateListingPayload {
  title?: string;
  category?: string;
  postalCode?: string;
  description?: string;
  quantity?: string;
  expiryDate?: string;
  city?: string;
  pickupInfo?: string;
  status?: 'DISPONIBLE' | 'RESERVEE' | 'DONNEE';
}