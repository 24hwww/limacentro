export interface Business {
  id: string | number;
  name: string;
  category: string;
  district: string;
  address: string;
  description: string;
  phone: string;
  website: string;
  rating: number;
  lat: number;
  lng: number;
  imageUrl?: string;
  ownerId?: string | number;
  source?: string;
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

declare global {
  interface Window {
    gtag: (param1: string, param2: string, param3?: object) => void;
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>,
          ) => void;
        };
      };
    };
  }
}
