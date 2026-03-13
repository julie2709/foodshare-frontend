export interface ListingPhoto {
  id: number;
  url: string;
  publicUrl?: string;
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
  photos: ListingPhoto[];
  user?: unknown | null;
}

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