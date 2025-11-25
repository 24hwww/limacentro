import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Business, User, ViewState, Coordinates } from '../types';
import { LIMA_CENTER, LIMA_DISTRICTS, CATEGORIES } from '../constants';
import { getBusinesses, addBusiness, getCurrentUser, logoutMock } from '../services/mockDatabase'; // Removed loginMock
import { BusinessCard } from '../components/BusinessCard';
import { BusinessForm } from '../components/BusinessForm';
import { BusinessDetailView } from '../components/BusinessDetailView';
import { Search, Map as MapIcon, Plus, LogOut, Menu } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton'; // Import the new component

// Dynamic Map Import
const MapBoard = dynamic(() => import('../components/MapBoard'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#262626] flex items-center justify-center text-gray-500">Cargando mapa de Lima...</div>
});

export default function HomePage() {
  // State declarations
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [showSidebarMobile, setShowSidebarMobile] = useState(true);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<Coordinates>(LIMA_CENTER);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  useEffect(() => {
    setBusinesses(getBusinesses());
    setUser(getCurrentUser());
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
  const handleLogout = () => {
    logoutMock();
    setUser(null);
  };

  const handleBusinessClick = (b: Business) => {
    setMapCenter({ lat: b.lat, lng: b.lng });
    setActiveBusinessId(String(b.id));
    setViewState('DETAILS');
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setShowSidebarMobile(false); 
    }
  };

  const handleMapBackgroundClick = () => {
    setActiveBusinessId(null);
  };

  const handleSaveBusiness = (newBusiness: Business) => {
    const updated = addBusiness(newBusiness);
    setBusinesses(updated);
    setViewState('LIST');
    setMapCenter({ lat: newBusiness.lat, lng: newBusiness.lng });
    setActiveBusinessId(String(newBusiness.id));
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
          className="md:hidden absolute top-4 right-4 z-[999] bg-white text-gray-800 p-3.5 rounded-full shadow-lg border border-gray-300 focus:ring-4 focus:ring-blue-500"
          aria-label={showSidebarMobile ? "Ocultar lista" : "Mostrar lista"}
        >
          {showSidebarMobile ? <MapIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* SIDEBAR AREA */}
      <div 
        className={`
          fixed inset-0 md:static z-10 bg-white md:w-[35%] lg:w-[30%] h-full flex flex-col shadow-2xl transition-transform duration-300 transform
          ${showSidebarMobile ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
          md:translate-x-0 md:border-l border-gray-300
        `}
      >
        {/* HEADER */}
        <div className="p-5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 text-white p-2 rounded-md font-extrabold tracking-tighter text-xl">LC</div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">LIMACENTRO</h1>
                          </div>
          </div>
          <div className="mt-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border border-gray-300" />
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors" aria-label="Cerrar sesión">
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        <div className="flex-1 overflow-hidden relative">
          {viewState === 'ADD_BUSINESS' ? (
            <BusinessForm 
              onCancel={() => setViewState('LIST')}
              onSave={handleSaveBusiness}
            />
          ) : (
            <div className="h-full flex flex-col">
              
              {/* SEARCH & FILTER BAR */}
              <div className="p-5 space-y-4 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow">
                    <label htmlFor="search-input" className="sr-only">Buscar negocios</label>
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Buscar restaurantes, servicios..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-shadow"
                    />
                  </div>
                  <button onClick={() => setShowFilterSidebar(true)} className="p-3 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors" aria-label="Abrir filtros">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-700"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                  </button>
                </div>
                
              </div>

              {/* ACTION BAR */}
              {user && (
                 <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-900">¿Tienes un negocio?</span>
                    <button 
                      onClick={() => setViewState('ADD_BUSINESS')}
                      className="flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    >
                      <Plus className="w-4 h-4" />
                      Registrar Gratis
                    </button>
                 </div>
              )}

              {/* LIST */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {filteredBusinesses.length === 0 ? (
                  <div className="p-10 text-center text-gray-600">
                    <p className="text-lg">No se encontraron negocios.</p>
                  </div>
                ) : (
                  <div>
                    <div className="px-5 py-3 text-sm font-bold text-gray-600 uppercase tracking-wider bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
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
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FILTER SIDEBAR OVERLAY */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-20 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          <div className="relative z-30 bg-white w-80 h-full shadow-xl flex flex-col">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Filtros</h2>
              <button onClick={() => setShowFilterSidebar(false)} className="p-2 text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Distrito</label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="mt-1 w-full text-base font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Todos los distritos</option>
                  {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Categoría</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full text-base font-medium border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
          onClose={() => setActiveBusinessId(null)} 
        />
      )}

    </div>
  );
};

