// Rating emojis: 🔥 (excelente) > 👍 (bueno) > 😑 (regular) > 🤢 (malo) > 💩 (pésimo)
export type RatingEmoji = '🔥' | '👍' | '😑' | '🤢' | '💩';

export interface Business {
  id: string;
  name: string;
  category: string;
  district: string;
  address: string;
  description: string;
  phone?: string | null;
  website?: string | null;
  rating: RatingEmoji;
  lat: number;
  lng: number;
  imageUrl?: string;
  ownerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type ViewState = 'LIST' | 'ADD_BUSINESS' | 'DETAILS';

export interface Coordinates {
  lat: number;
  lng: number;
}
