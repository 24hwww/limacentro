import { Business } from '../types';

export const apiService = {
    async getBusinesses(): Promise<Business[]> {
        const response = await fetch('/api/businesses');
        if (!response.ok) {
            throw new Error('Failed to fetch businesses');
        }
        return response.json();
    },

    async createBusiness(business: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>): Promise<Business> {
        const response = await fetch('/api/businesses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(business),
        });
        if (!response.ok) {
            throw new Error('Failed to create business');
        }
        return response.json();
    },

    async updateBusiness(id: string, business: Partial<Business>): Promise<Business> {
        const response = await fetch(`/api/businesses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(business),
        });
        if (!response.ok) {
            throw new Error('Failed to update business');
        }
        return response.json();
    },

    async deleteBusiness(id: string): Promise<void> {
        const response = await fetch(`/api/businesses/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete business');
        }
    }
};
