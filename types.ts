export type Language = 'en' | 'zu' | 'xh' | 'nso' | 'st' | 'tn' | 'ts' | 'ss' | 've' | 'nr';

export enum AmenityStatus {
  FREE = 'Free',
  PAID = 'Paid by Tenant',
  NOT_AVAILABLE = 'Not Available',
}

export enum ListingStatus {
  AVAILABLE = 'Available Now',
  TAKEN = 'Taken',
  AVAILABLE_FROM = 'Available From',
}

export interface Address {
  street: string;
  suburb: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  title: string; // was resName
  description: string;
  landlordId: string;
  landlordName: string; // Denormalized for display
  contactPhone: string;
  contactWhatsApp: boolean;
  landlordIdNumber?: string; // New field
  price: number;
  deposit: number;
  address: Address;
  photos: string[]; // [interior, exterior, ...]
  amenities: {
    wifi: AmenityStatus;
    water: AmenityStatus;
    electricity: AmenityStatus;
    bathroom: AmenityStatus;
  };
  beds: number;
  baths: number;
  furnished: boolean;
  safety: number; // 0-100
  rating: number; // 0-5
  status: ListingStatus;
  availableDate?: string;
  createdAt: number;
}

export type ViewRole = 'LANDLORD' | 'TENANT' | 'HOME';