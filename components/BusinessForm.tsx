import React, { useState } from 'react';
import { LIMA_DISTRICTS, CATEGORIES, RATING_OPTIONS } from '../constants';
import { geocodeAddress } from '../lib/geocodingService';
import { generateBusinessDescription } from '../lib/geminiService';
import { Business, RatingEmoji } from '../types';
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
    rating: '👍', // Default rating
  });

  const [previewCoords, setPreviewCoords] = useState<{ lat: number, lng: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset geocoding if address changes
    if (name === 'address' || name === 'district') {
      setPreviewCoords(null);
    }
  };

  const handleRatingChange = (rating: RatingEmoji) => {
    setFormData(prev => ({ ...prev, rating }));
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
    if (!formData.name || !formData.description) {
      setError("Completa los campos obligatorios.");
      return;
    }

    const newBusiness: Business = {
      ...formData as Business,
      id: crypto.randomUUID(),
      lat: previewCoords.lat,
      lng: previewCoords.lng,
      imageUrl: `https://picsum.photos/seed/${formData.name}/400/300` // Random image for demo
    };

    onSave(newBusiness);
  };

  return (
    <div className="p-6 bg-white h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registrar Negocio</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej. Restaurante Central"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                {LIMA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Rating Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Calificación Inicial</label>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRatingChange(option.value as RatingEmoji)}
                  className={`
                    p-2 rounded-lg text-2xl transition-all border
                    ${formData.rating === option.value
                      ? 'bg-blue-50 border-blue-500 scale-110 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                    }
                  `}
                  title={option.label}
                >
                  {option.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" /> Ubicación
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dirección (Incluir Av./Jr./Calle y número)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Ej. Av. Larco 1348"
                />
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={loadingGeo}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {loadingGeo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ubicar'}
                </button>
              </div>
            </div>
            {previewCoords && (
              <div className="text-xs text-green-600 font-medium flex items-center bg-green-50 p-2 rounded">
                ✓ Coordenadas encontradas: {previewCoords.lat.toFixed(4)}, {previewCoords.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* AI Description Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
            <span>Descripción</span>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={loadingAI}
              className="text-xs text-purple-600 hover:text-purple-800 flex items-center font-bold"
            >
              {loadingAI ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />}
              Generar con AI
            </button>
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Describe los servicios, ambiente, etc."
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex justify-center items-center shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Negocio
          </button>
        </div>
      </form>
    </div>
  );
};
