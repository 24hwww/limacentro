import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Business, User, ViewState, Coordinates } from './types';
import { LIMA_CENTER, LIMA_DISTRICTS, CATEGORIES } from './constants';
import { getBusinesses, addBusiness, getCurrentUser, loginMock, logoutMock } from './services/mockDatabase';
import { BusinessCard } from './components/BusinessCard';
import { BusinessForm } from './components/BusinessForm';
import { BusinessDetailView } from './components/BusinessDetailView';
import { Search, Map as MapIcon, Plus, User as UserIcon, LogOut, Menu } from 'lucide-react';

// Fix for Leaflet default marker icons in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle Map flying
const MapController = ({ center }: { center: Coordinates }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], 13, {
      animate: true,
      duration: 1.5
    });
  }, [center, map]);
  return null;
};

// Component to handle Map background clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: () => void }) => {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
};

const App: React.FC = () => {
  // Global State
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // View State
  const [viewState, setViewState] = useState<ViewState>('LIST');
  const [showSidebarMobile, setShowSidebarMobile] = useState(true); 
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Map State
  const [mapCenter, setMapCenter] = useState<Coordinates>(LIMA_CENTER);
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    setBusinesses(getBusinesses());
    setUser(getCurrentUser());
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
  const handleLogin = () => {
    const u = loginMock();
    setUser(u);
  };

  const handleLogout = () => {
    logoutMock();
    setUser(null);
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
      <div className="relative w-full h-full md:w-[65%] lg:w-[70%] z-0">
        <MapContainer 
          center={[LIMA_CENTER.lat, LIMA_CENTER.lng]} 
          zoom={12} 
          scrollWheelZoom={true} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} />
          <MapClickHandler onMapClick={handleMapBackgroundClick} />
          
          {filteredBusinesses.map(b => (
            <Marker 
              key={b.id} 
              position={[b.lat, b.lng]}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e.originalEvent);
                  handleBusinessClick(b);
                }
              }}
            />
          ))}
        </MapContainer>

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
            <div className="bg-red-600 text-white p-1.5 rounded font-bold tracking-tighter text-lg">LC</div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">LIMACENTRO</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {user ? (
               <div className="flex items-center gap-2">
                  <img src={user.avatarUrl} alt="User" className="w-8 h-8 rounded-full border border-gray-200" />
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-600">
                    <LogOut className="w-5 h-5" />
                  </button>
               </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}
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
            <div className="h-full flex flex-col">
              
              {/* SEARCH & FILTER BAR */}
              <div className="p-4 space-y-3 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar restaurantes, servicios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <select 
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white min-w-[100px]"
                  >
                    <option value="">Todos los distritos</option>
                    {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white min-w-[100px]"
                  >
                    <option value="">Todas las categorías</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

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
};

export default App;