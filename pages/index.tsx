import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Business, ViewState, Coordinates } from '../types';
import { LIMA_CENTER, LIMA_DISTRICTS, CATEGORIES } from '../constants';
import { getBusinesses, addBusiness } from '../services/mockDatabase';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessForm } from '../components/BusinessForm';
import { BusinessDetailView } from '../components/BusinessDetailView';
import { Footer } from '../components/Footer';
import { Search, Map as MapIcon, Plus, LogOut, Menu } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { OnlineUsersCounter } from '../components/OnlineUsersCounter';

// Dynamic Map Import
const MapBoard = dynamic(() => import('../components/MapBoard'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#262626] flex items-center justify-center text-gray-500">Cargando mapa de Lima...</div>
});

// Dynamic User Profile Import (client-only)
const UserProfileRenderer = dynamic(() => import('../components/UserProfileRenderer'), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();
  
  // State declarations
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [mapCenter, setMapCenter] = useState<Coordinates>(LIMA_CENTER);

  // URL-based state management
  const viewState = (router.query.view as ViewState) || 'LIST';
  const searchQuery = (router.query.q as string) || '';
  const selectedDistrict = (router.query.district as string) || '';
  const selectedCategory = (router.query.category as string) || '';
  const activeBusinessId = (router.query.business as string) || null;

  // Update URL when state changes
  const updateURL = (newParams: Record<string, string | null>) => {
    const currentQuery = { ...router.query };
    
    // Remove null/undefined values
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === null || newParams[key] === undefined) {
        delete currentQuery[key];
      } else {
        currentQuery[key] = newParams[key];
      }
    });

    // Remove empty view parameter if it's the default
    if (currentQuery.view === 'LIST') {
      delete currentQuery.view;
    }

    router.push(
      { pathname: router.pathname, query: currentQuery },
      undefined,
      { shallow: true }
    );
  };

  // Initialize businesses
  useEffect(() => {
    setBusinesses(getBusinesses());
  }, []);

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
  const handleBusinessClick = (b: Business) => {
    setMapCenter({ lat: b.lat, lng: b.lng });
    updateURL({ 
      business: String(b.id), 
      view: 'DETAILS',
      q: searchQuery || null,
      district: selectedDistrict || null,
      category: selectedCategory || null
    });
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebarMobile(false);
    }
  };

  const handleMapBackgroundClick = () => {
    updateURL({ 
      business: null,
      view: viewState === 'DETAILS' ? 'LIST' : undefined,
      q: searchQuery || null,
      district: selectedDistrict || null,
      category: selectedCategory || null
    });
  };

  const handleSaveBusiness = (newBusiness: Business) => {
    const updated = addBusiness(newBusiness);
    setBusinesses(updated);
    setMapCenter({ lat: newBusiness.lat, lng: newBusiness.lng });
    updateURL({ 
      business: String(newBusiness.id), 
      view: 'DETAILS',
      q: searchQuery || null,
      district: selectedDistrict || null,
      category: selectedCategory || null
    });
  };

  const handleSearchChange = (value: string) => {
    updateURL({ 
      q: value || null,
      district: selectedDistrict || null,
      category: selectedCategory || null,
      business: null,
      view: 'LIST'
    });
  };

  const handleDistrictChange = (value: string) => {
    updateURL({ 
      district: value || null,
      q: searchQuery || null,
      category: selectedCategory || null,
      business: null,
      view: 'LIST'
    });
  };

  const handleCategoryChange = (value: string) => {
    updateURL({ 
      category: value || null,
      q: searchQuery || null,
      district: selectedDistrict || null,
      business: null,
      view: 'LIST'
    });
  };

  const handleAddBusiness = () => {
    updateURL({ 
      view: 'ADD_BUSINESS',
      business: null,
      q: searchQuery || null,
      district: selectedDistrict || null,
      category: selectedCategory || null
    });
  };

  const handleCancelAddBusiness = () => {
    updateURL({ 
      view: 'LIST',
      business: null,
      q: searchQuery || null,
      district: selectedDistrict || null,
      category: selectedCategory || null
    });
  };

  const toggleSidebar = () => setShowSidebarMobile(!showSidebarMobile);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-100 font-sans text-gray-900">

      {/* MAP AREA */}
      <div className="relative w-full h-full md:w-[65%] lg:w-[70%] z-0 bg-[#262626]">
        <MapBoard
          center={mapCenter}
          businesses={filteredBusinesses}
          onMarkerClick={handleBusinessClick}
          onMapBackgroundClick={handleMapBackgroundClick}
        />
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 right-4 z-[60] bg-white text-gray-800 p-3 rounded-full shadow-lg border border-gray-300 focus:ring-4 focus:ring-blue-500 transition-all hover:scale-105"
          aria-label={showSidebarMobile ? "Ocultar lista" : "Mostrar lista"}
        >
          {showSidebarMobile ? <MapIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {showSidebarMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          onClick={() => setShowSidebarMobile(false)}
        />
      )}

      {/* SIDEBAR AREA */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-full max-w-sm bg-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out transform
          md:relative md:inset-auto md:max-w-none md:w-[400px] lg:w-[450px] xl:w-[500px]
          ${showSidebarMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:border-r md:border-gray-200
        `}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl tracking-tight">LIMACENTRO</h1>
            <OnlineUsersCounter />
          </div>
          <div className="mt-3 sm:mt-4">
            <UserProfileRenderer>
              {(user) => user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {user.image && (
                      <img src={user.image} alt={user.name || 'Usuario'} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-900 truncate">{user.name}</span>
                  </div>
                  <button
                    onClick={async () => {
                      const { signOut } = await import('next-auth/react');
                      await signOut();
                    }}
                    className="text-gray-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              ) : (
                <GoogleSignInButton />
              )}
            </UserProfileRenderer>
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        <div className="flex-1 overflow-hidden relative">
          {viewState === 'ADD_BUSINESS' ? (
            <BusinessForm
              onCancel={handleCancelAddBusiness}
              onSave={handleSaveBusiness}
            />
          ) : (
            <div className="h-full flex flex-col">

              {/* SEARCH & FILTER BAR */}
              <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <label htmlFor="search-input" className="sr-only">Buscar negocios</label>
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Buscar restaurantes, servicios..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-shadow"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilterSidebar(true)}
                    className="p-2 sm:p-3 bg-gray-100 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors"
                    aria-label="Abrir filtros"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                  </button>
                </div>

              </div>

              {/* ACTION BAR */}
              <UserProfileRenderer>
                {(user) => user && (
                  <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-blue-50 border-b border-blue-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-blue-900">¿Tienes un negocio?</span>
                    <button
                      onClick={handleAddBusiness}
                      className="flex items-center justify-center gap-1.5 bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Registrar Gratis
                    </button>
                  </div>
                )}
              </UserProfileRenderer>

              {/* LIST */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col">
                {filteredBusinesses.length === 0 ? (
                  <div className="p-6 sm:p-10 text-center text-gray-600 flex-1">
                    <p className="text-base sm:text-lg">No se encontraron negocios.</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                      {filteredBusinesses.length} Resultados en Lima
                    </div>
                    <div className="flex-1">
                      {filteredBusinesses.map(b => (
                        <BusinessCard
                          key={b.id}
                          business={b}
                          onClick={handleBusinessClick}
                          isActive={activeBusinessId === b.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* FOOTER */}
                <Footer />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER SIDEBAR OVERLAY */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          <div className="relative bg-white w-72 sm:w-80 h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 sm:p-5 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold">Filtros</h2>
              <button
                onClick={() => setShowFilterSidebar(false)}
                className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar filtros"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Distrito</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full text-base font-medium border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos los distritos</option>
                  {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-base font-medium border border-gray-300 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL OVERLAY */}
      {selectedBusiness && (
        <BusinessDetailView
          business={selectedBusiness}
          onClose={() => updateURL({ 
            business: null, 
            view: 'LIST',
            q: searchQuery || null,
            district: selectedDistrict || null,
            category: selectedCategory || null
          })}
        />
      )}
    </div>
  );
};

