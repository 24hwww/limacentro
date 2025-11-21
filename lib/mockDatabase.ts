import { Business } from '../types';
import { INITIAL_BUSINESSES } from '../constants';

const BUSINESS_STORAGE_KEY = 'limacentro_businesses';

export const getBusinesses = (): Business[] => {
  if (typeof window === 'undefined') return INITIAL_BUSINESSES;

  const stored = localStorage.getItem(BUSINESS_STORAGE_KEY);
  if (!stored) {
    // Seed initial data
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(INITIAL_BUSINESSES));
    return INITIAL_BUSINESSES;
  }
  return JSON.parse(stored);
};

export const addBusiness = (business: Business): Business[] => {
  if (typeof window === 'undefined') return [business];

  const current = getBusinesses();
  const updated = [business, ...current];
  localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
