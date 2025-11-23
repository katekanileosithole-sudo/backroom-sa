import { Listing } from '../types';
import { MOCK_LISTINGS } from '../constants';

const KEYS = {
  LISTINGS: 'backroom_listings_data_v1',
};

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockBackend = {
  // Fetch all listings
  async getListings(): Promise<Listing[]> {
    await delay(800); // Simulate network request
    const stored = localStorage.getItem(KEYS.LISTINGS);
    if (!stored) {
      // Seed with mock data if empty
      localStorage.setItem(KEYS.LISTINGS, JSON.stringify(MOCK_LISTINGS));
      return MOCK_LISTINGS;
    }
    return JSON.parse(stored);
  },

  // Add a new listing
  async addListing(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    await delay(1500); // Simulate processing
    const currentListings = await this.getListings();
    
    const newListing: Listing = {
      ...listing,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };

    const updatedListings = [newListing, ...currentListings];
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(updatedListings));
    
    return newListing;
  },

  // Simulate OTP send
  async sendOtp(phone: string): Promise<void> {
    await delay(1000);
    console.log(`[Backend] OTP sent to ${phone}: 1234`);
  },

  // Simulate OTP verify
  async verifyOtp(phone: string, code: string): Promise<boolean> {
    await delay(1000);
    return code === '1234';
  }
};