'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Business } from '../../types';
import { apiService } from '../../lib/apiService';
import { Check, X, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session || session.user?.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        loadBusinesses();
    }, [session, status, router]);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            // Fetch all businesses (admin=true)
            const data = await apiService.getBusinesses(true);
            // Filter for pending ones locally or update API to support status filter
            // For now, let's filter client-side as the list shouldn't be massive yet
            setBusinesses(data.filter(b => b.status === 'PENDING'));
        } catch (error) {
            console.error("Failed to load businesses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            await apiService.updateBusiness(id, { status: newStatus });
            // Remove from list
            setBusinesses(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Error al actualizar el estado");
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Negocios Pendientes ({businesses.length})</h2>
                    </div>

                    {businesses.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No hay negocios pendientes de aprobación.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {businesses.map((business) => (
                                <div key={business.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors">
                                    {/* Image */}
                                    <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={business.imageUrl || "https://picsum.photos/200"}
                                            alt={business.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full mb-2">
                                                    {business.category}
                                                </span>
                                                <h3 className="text-xl font-bold text-gray-900">{business.name}</h3>
                                            </div>
                                            <div className="text-sm text-gray-500 text-right">
                                                <p>{new Date(business.createdAt || Date.now()).toLocaleDateString()}</p>
                                                <p>{business.district}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>

                                        <div className="flex gap-4 text-sm text-gray-500 mb-4">
                                            <span>📍 {business.address}</span>
                                            {business.phone && <span>📞 {business.phone}</span>}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleStatusChange(business.id, 'APPROVED')}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                            >
                                                <Check className="w-4 h-4" /> Aprobar
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(business.id, 'REJECTED')}
                                                className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                                            >
                                                <X className="w-4 h-4" /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
