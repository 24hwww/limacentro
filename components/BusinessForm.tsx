import React, { useState } from 'react';
import { LIMA_DISTRICTS, CATEGORIES } from '../constants';
import { geocodeAddress } from '../services/geocodingService';
import { generateBusinessDescription } from '../services/geminiService';
import { Business } from '../types';
import { Loader2, Wand2, MapPin, Save, X } from 'lucide-react';

interface BusinessFormProps {
  onCancel: () => void;
  onSave: (business: Business) => void;
}

export const BusinessForm: React.FC<BusinessFormProps> = ({ onCancel, onSave }) => {
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Business>>({
    name: '',
    category: CATEGORIES[0],
    district: LIMA_DISTRICTS[0],
    address: '',
    description: '',
    phone: '',
    website: '',
    rating: 5, // Default rating
  });

  const [previewCoords, setPreviewCoords] = useState<{lat: number, lng: number} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset geocoding if address changes
    if (name === 'address' || name === 'district') {
      setPreviewCoords(null);
    }
  };

  const handleGeocode = async () => {
    if (!formData.address || !formData.district) {
      setError("Por favor ingresa una dirección y selecciona un distrito.");
      return;
    }
    
    setLoadingGeo(true);
    setError(null);
    try {
      const coords = await geocodeAddress(formData.address, formData.district);
      if (coords) {
        setPreviewCoords(coords);
      } else {
        setError("No se pudieron encontrar las coordenadas. Intenta ser más específico con la dirección.");
      }
    } catch (err) {
      setError("Error al conectar con el servicio de mapas.");
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.category) {
      setError("Ingresa el nombre y categoría para generar una descripción.");
      return;
    }
    setLoadingAI(true);
    try {
      const desc = await generateBusinessDescription(
        formData.name,
        formData.category,
        formData.district || '',
        formData.description || '' // Pass existing description as keywords
      );
      setFormData(prev => ({ ...prev, description: desc }));
    } catch (err) {
      setError("Error generando la descripción con AI.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewCoords) {
      setError("Debes validar la ubicación en el mapa antes de guardar (Click en 'Ubicar').");
      return;
    }
    
    // Validación estricta según requisitos del proyecto
    if (!formData.name || !formData.description || !formData.phone || !formData.website) {
      setError("Por favor completa todos los campos obligatorios, incluyendo contacto.");
      return;
    }

    const newBusiness: Business = {
      id: crypto.randomUUID(),
      ...formData as Business,
      lat: previewCoords.lat,
      lng: previewCoords.lng,
      imageUrl: `https://picsum.photos/seed/${formData.name}/400/300` // Random image for demo
    };

    onSave(newBusiness);
  };

  return (
    <div className="p-6 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Registrar Negocio</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500" aria-label="Cancelar">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-4 bg-red-50 text-red-800 text-sm rounded-md border border-red-200 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-gray-900 mb-2">Nombre del Negocio *</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder:text-gray-500"
              placeholder="Ej. Restaurante Central"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className="block text-base font-semibold text-gray-900 mb-2">Categoría *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-600"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="district" className="block text-base font-semibold text-gray-900 mb-2">Distrito *</label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900 focus:ring-2 focus:ring-blue-600"
              >
                {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-300">
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-700" /> Ubicación *
          </h3>
          <div className="space-y-4">
             <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Dirección (Incluir Av./Jr./Calle y número)</label>
              <div className="flex gap-3">
                <input
                  id="address"
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-500"
                  placeholder="Ej. Av. Larco 1348"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={loadingGeo}
                  className="bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-bold hover:bg-blue-800 disabled:opacity-70 flex items-center focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                >
                  {loadingGeo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ubicar'}
                </button>
              </div>
             </div>
             {previewCoords && (
               <div className="text-sm text-green-800 font-semibold flex items-center bg-green-100 p-3 rounded border border-green-200">
                 ✓ Coordenadas encontradas: {previewCoords.lat.toFixed(4)}, {previewCoords.lng.toFixed(4)}
               </div>
             )}
          </div>
        </div>

        {/* AI Description Section */}
        <div>
          <div className="flex justify-between mb-2 items-center">
            <label htmlFor="description" className="block text-base font-semibold text-gray-900">Descripción *</label>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={loadingAI}
              className="text-sm text-purple-700 hover:text-purple-900 flex items-center font-bold focus:outline-none focus:underline"
            >
              {loadingAI ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Wand2 className="w-4 h-4 mr-1.5" />}
              Generar con AI
            </button>
          </div>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-500"
            placeholder="Describe los servicios, ambiente, etc."
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="phone" className="block text-base font-semibold text-gray-900 mb-2">Teléfono / WhatsApp *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900"
            />
          </div>
          <div>
             <label htmlFor="website" className="block text-base font-semibold text-gray-900 mb-2">Sitio Web *</label>
            <input
              id="website"
              type="url"
              name="website"
              required
              value={formData.website}
              onChange={handleInputChange}
              className="w-full border border-gray-400 rounded-lg px-4 py-3 text-base text-gray-900"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-6 flex gap-4">
           <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-white text-gray-800 border border-gray-300 rounded-xl font-bold text-base hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-xl font-bold text-base hover:bg-black transition-colors flex justify-center items-center shadow-lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Guardar Negocio
          </button>
        </div>
      </form>
    </div>
  );
};