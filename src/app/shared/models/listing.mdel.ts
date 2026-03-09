export interface ListingPhoto {
  id: number;
  url: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  quantity?: string;
  expiryDate?: string;
  city: string;
  postalCode: string;
  pickupInfo?: string;
  status: 'DISPONIBLE' | 'RESERVEE' | 'DONNEE';
  createdAt?: string;
  photos?: ListingPhoto[];
}