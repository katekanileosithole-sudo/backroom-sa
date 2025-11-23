import React from 'react';
import { Listing } from '../types';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  listings: Listing[];
  onMarkerClick: (id: string) => void;
}

const MapView: React.FC<MapViewProps> = ({ listings, onMarkerClick }) => {
  // Determine bounds
  const lats = listings.map(l => l.address.lat);
  const lngs = listings.map(l => l.address.lng);
  
  const minLat = Math.min(...lats) - 0.05;
  const maxLat = Math.max(...lats) + 0.05;
  const minLng = Math.min(...lngs) - 0.05;
  const maxLng = Math.max(...lngs) + 0.05;

  const getPosition = (lat: number, lng: number) => {
    // Normalize coordinates to percentage (0-100)
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    return { top: `${y}%`, left: `${x}%` };
  };

  return (
    <div className="w-full h-[600px] bg-gray-100 rounded-3xl overflow-hidden relative border border-gray-200 shadow-inner group">
      
      {/* Fake Map Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{ 
            backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
        }}></div>
      </div>
      
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-xl shadow-sm text-xs text-gray-500 border border-gray-100">
        <p className="font-bold text-gray-800">Map View Simulation</p>
        <p>Pins represent listing locations</p>
      </div>

      {listings.map((listing) => {
        const pos = getPosition(listing.address.lat, listing.address.lng);
        return (
          <div 
            key={listing.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 hover:z-20 group/pin"
            style={{ top: pos.top, left: pos.left }}
            onClick={() => onMarkerClick(listing.id)}
          >
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover/pin:opacity-100 transition-opacity bg-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap text-brand-dark">
                R{listing.price}
             </div>
             <MapPin className="w-10 h-10 text-brand-orange fill-white drop-shadow-md" />
          </div>
        );
      })}

      {listings.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
           No listings to display on map.
        </div>
      )}
    </div>
  );
};

export default MapView;