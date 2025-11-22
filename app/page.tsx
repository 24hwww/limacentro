'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import { Business, ViewState, Coordinates } from '../types';
import { LIMA_CENTER, LIMA_DISTRICTS, CATEGORIES } from '../constants';
import { getBusinesses, addBusiness } from '../lib/mockDatabase';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessForm } from '../components/BusinessForm';
import { BusinessDetailView } from '../components/BusinessDetailView';
import { Footer } from '../components/Footer';
import GoogleSignInButton from '../components/GoogleSignInButton';
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
    // NextAuth Session (Edge compatible)
    const { data: session } = useSession();
    const user = session?.user;

    // Global State
    const [businesses, setBusinesses] = useState<Business[]>([]);

    // View State
    const [viewState, setViewState] = useState<ViewState>('LIST');
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
        setBusinesses(getBusinesses());
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
    const handleLogout = () => {
        signOut();
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

    const handleSaveBusiness = (newBusiness: Business) => {
        const updated = addBusiness(newBusiness);
        setBusinesses(updated);
        setViewState('LIST');
        // Focus on new business
        setMapCenter({ lat: newBusiness.lat, lng: newBusiness.lng });
        setActiveBusinessId(newBusiness.id);
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
                                            <GoogleSignInButton />
                                        </div>
                                    )}
                                </div>

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
                                        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0">
                                            {filteredBusinesses.length} Resultados en Lima
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
