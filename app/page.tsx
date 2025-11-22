'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useStackApp, useUser } from '@stackframe/stack';
import { Business, ViewState, Coordinates } from '../types';
import { LIMA_CENTER, LIMA_DISTRICTS, CATEGORIES } from '../constants';
import { apiService } from '../lib/apiService';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessForm } from '../components/BusinessForm';
import { BusinessDetailView } from '../components/BusinessDetailView';
import { Footer } from '../components/Footer';
import { Search, Map as MapIcon, Plus, LogOut, Menu, SlidersHorizontal, X } from 'lucide-react';

// Dynamically import the Map component with SSR disabled
const MapComponent = dynamic(() => import('../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Cargando mapa...</p>
            </div>
        </div>
    ),
});

export default function Home() {
    // Stack Auth
    const app = useStackApp();
    const stackUser = useUser();
    const user = stackUser ? {
        name: stackUser.displayName || stackUser.primaryEmail || 'Usuario',
        email: stackUser.primaryEmail || '',
        image: stackUser.profileImageUrl || undefined,
    } : null;

    // Global State
    const [businesses, setBusinesses] = useState<Business[]>([]);

    // View State
    const [viewState, setViewState] = useState<ViewState | 'MY_BUSINESSES'>('LIST');
    const [showSidebarMobile, setShowSidebarMobile] = useState(true);

    // Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Map State
    const [mapCenter, setMapCenter] = useState<Coordinates>(LIMA_CENTER);
    const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

    // Initialize
    useEffect(() => {
        const loadBusinesses = async () => {
            try {
                const data = await apiService.getBusinesses();
                setBusinesses(data);
            } catch (error) {
                console.error("Failed to load businesses", error);
            }
        };
        loadBusinesses();
    }, []);

    // Filter Logic
    const filteredBusinesses = useMemo(() => {
        return businesses.filter(b => {
            const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDistrict = selectedDistrict ? b.district === selectedDistrict : true;
            const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
            return matchesSearch && matchesDistrict && matchesCategory;
        });
    }, [businesses, searchQuery, selectedDistrict, selectedCategory]);

    const selectedBusiness = useMemo(() =>
        businesses.find(b => b.id === activeBusinessId),
        [businesses, activeBusinessId]);

    // Handlers
    const handleLogout = async () => {
        await app.signOut();
    };

    const handleBusinessClick = (b: Business) => {
        setMapCenter({ lat: b.lat, lng: b.lng });
        setActiveBusinessId(b.id);
        setViewState('DETAILS');
        if (window.innerWidth < 768) {
            setShowSidebarMobile(false); // On mobile, hide sidebar to show map and bottom sheet
        }
    };

    const handleMapBackgroundClick = () => {
        setActiveBusinessId(null);
    };

    const handleSaveBusiness = async (newBusiness: Business) => {
        try {
            // Remove ID as backend generates it
            const { id, ...businessData } = newBusiness;
            const savedBusiness = await apiService.createBusiness(businessData);

            // Check if it's pending (it should be for non-admins)
            if (savedBusiness.status === 'PENDING') {
                alert("Tu negocio ha sido registrado y está pendiente de aprobación por el administrador.");
            } else {
                setBusinesses(prev => [savedBusiness, ...prev]);
                // Focus on new business
                setMapCenter({ lat: savedBusiness.lat, lng: savedBusiness.lng });
                setActiveBusinessId(savedBusiness.id);
            }
            setViewState('LIST');
        } catch (error) {
            console.error("Failed to save business", error);
            alert("Error al guardar el negocio");
        }
    };

    // Mobile Toggle
    const toggleSidebar = () => setShowSidebarMobile(!showSidebarMobile);

    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-900">

            {/* MAP AREA (Left/Top) */}
            <div className="relative w-full h-full md:w-[65%] lg:w-[70%] z-0 bg-gray-900">
                <MapComponent
                    center={mapCenter}
                    businesses={filteredBusinesses}
                    onBusinessClick={handleBusinessClick}
                    onMapBackgroundClick={handleMapBackgroundClick}
                />

                {/* Mobile Toggle Button (Floating) */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden absolute top-4 right-4 z-[999] bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-200"
                >
                    {showSidebarMobile ? <MapIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* SIDEBAR AREA (Right/Bottom) */}
            <div
                className={`
          fixed inset-0 md:static z-10 bg-white md:w-[35%] lg:w-[30%] h-full flex flex-col shadow-2xl transition-transform duration-300 transform
          ${showSidebarMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          md:translate-x-0 md:border-l border-gray-200
        `}
            >
                {/* HEADER */}
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">LIMACENTRO</h1>
                    </div>
                </div>

                {/* CONTENT SWITCHER */}
                <div className="flex-1 overflow-hidden relative">

                    {/* VIEW: ADD BUSINESS */}
                    {viewState === 'ADD_BUSINESS' ? (
                        <BusinessForm
                            onCancel={() => setViewState('LIST')}
                            onSave={handleSaveBusiness}
                        />
                    ) : (

                        /* VIEW: LIST / DETAILS */
                        <div className="h-full flex flex-col relative">

                            {/* SEARCH & FILTER BAR */}
                            <div className="p-4 space-y-3 bg-white border-b border-gray-100 flex-shrink-0">
                                {/* User / Login Section */}
                                <div className="flex justify-end mb-2">
                                    {user ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                            <img src={user.image || ''} alt={user.name || 'User'} className="w-8 h-8 rounded-full border border-gray-200" />
                                            <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="Cerrar sesión">
                                                <LogOut className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <button
                                                onClick={() => app.redirectToSignIn()}
                                                className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                Iniciar sesión con Google
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* My Businesses Button */}
                                {user && (
                                    <div className="px-4 pb-2 flex justify-end">
                                        <button
                                            onClick={() => {
                                                if (viewState === 'MY_BUSINESSES') {
                                                    setViewState('LIST');
                                                    // Reload all businesses
                                                    apiService.getBusinesses().then(setBusinesses);
                                                } else {
                                                    setViewState('MY_BUSINESSES');
                                                    // Load my businesses
                                                    apiService.getBusinesses(false, true).then(setBusinesses);
                                                }
                                            }}
                                            className="text-xs font-medium text-blue-600 hover:underline"
                                        >
                                            {viewState === 'MY_BUSINESSES' ? 'Ver todos los negocios' : 'Mis Negocios'}
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`p-2 rounded-lg border ${showFilters || selectedDistrict || selectedCategory ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                                    >
                                        <SlidersHorizontal className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* FILTER SIDEBAR */}
                            {showFilters && (
                                <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in slide-in-from-left duration-300">
                                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-bold text-lg text-gray-900">Filtros</h2>
                                        <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="p-4 space-y-6 overflow-y-auto">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Distrito</label>
                                            <select
                                                value={selectedDistrict}
                                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            >
                                                <option value="">Todos los distritos</option>
                                                {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                            >
                                                <option value="">Todas las categorías</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {(selectedDistrict || selectedCategory) && (
                                            <button
                                                onClick={() => { setSelectedDistrict(''); setSelectedCategory(''); }}
                                                className="text-sm text-red-500 hover:underline w-full text-left"
                                            >
                                                Limpiar filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ACTION BAR (Add Business) */}
                            {user && (
                                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex justify-between items-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-blue-800">¿Tienes un negocio?</span>
                                    <button
                                        onClick={() => setViewState('ADD_BUSINESS')}
                                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Registrar Gratis
                                    </button>
                                </div>
                            )}

                            {/* SCROLLABLE LIST */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {filteredBusinesses.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <p>No se encontraron negocios.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 z-10 flex justify-between">
                                            <span>{filteredBusinesses.length} Resultados {viewState === 'MY_BUSINESSES' ? '(Mis Negocios)' : 'en Lima'}</span>
                                        </div>
                                        {filteredBusinesses.map(b => (
                                            <BusinessCard
                                                key={b.id}
                                                business={b}
                                                onClick={handleBusinessClick}
                                                isActive={activeBusinessId === b.id}
                                            />
                                        ))}
                                        <Footer />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAIL OVERLAY (Mobile Bottom Sheet / Desktop Modal) */}
            {selectedBusiness && (
                <BusinessDetailView
                    business={selectedBusiness}
                    onClose={() => setActiveBusinessId(null)}
                />
            )}

        </div>
    );
}
