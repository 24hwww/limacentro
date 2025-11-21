export const LIMA_CENTER = {
  lat: -12.0464,
  lng: -77.0428,
};

export const LIMA_DISTRICTS = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
  "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María",
  "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho",
  "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
  "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
  "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
  "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
  "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco",
  "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
];

export const CATEGORIES = [
  "Restaurante", "Hotel", "Tienda", "Servicios", "Salud", "Educación", "Tecnología", "Turismo", "Otros"
];

export const RATING_OPTIONS = [
  { emoji: '🔥', label: 'Excelente', value: '🔥' },
  { emoji: '👍', label: 'Bueno', value: '👍' },
  { emoji: '😑', label: 'Regular', value: '😑' },
  { emoji: '🤢', label: 'Malo', value: '🤢' },
  { emoji: '💩', label: 'Pésimo', value: '💩' },
];

// Placeholder for initial data so the map isn't empty
export const INITIAL_BUSINESSES = [
  {
    id: "1",
    name: "Cevichería El Muelle",
    category: "Restaurante",
    district: "Miraflores",
    address: "Av. La Mar 1234",
    description: "El mejor ceviche de Miraflores con pesca del día.",
    phone: "+51 1 234 5678",
    website: "https://elmuelle.pe",
    rating: '🔥' as const,
    lat: -12.1123,
    lng: -77.0435,
    imageUrl: "https://picsum.photos/400/300"
  },
  {
    id: "2",
    name: "Hotel Lima History",
    category: "Hotel",
    district: "Lima",
    address: "Jr. de la Unión 555",
    description: "Hotel boutique en el corazón del centro histórico.",
    phone: "+51 1 987 6543",
    website: "https://limahistory.com",
    rating: '👍' as const,
    lat: -12.0450,
    lng: -77.0310,
    imageUrl: "https://picsum.photos/401/300"
  },
  {
    id: "3",
    name: "TechSolutions Perú",
    category: "Tecnología",
    district: "San Isidro",
    address: "Av. Rivera Navarrete 789",
    description: "Soluciones de software y hardware empresarial.",
    phone: "+51 1 555 1234",
    website: "https://techsolutions.pe",
    rating: '👍' as const,
    lat: -12.0950,
    lng: -77.0280,
    imageUrl: "https://picsum.photos/402/300"
  }
];
