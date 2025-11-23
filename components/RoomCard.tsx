import React, { useState } from 'react';
import { Listing, AmenityStatus, ListingStatus } from '../types';
import { Wifi, Droplets, Zap, Bed, ShieldCheck, Phone, MapPin, Bath, MessageCircle, Map, Flag, Star, AlertTriangle } from 'lucide-react';

interface RoomCardProps {
  listing: Listing;
  t: (key: string) => string;
}

const RoomCard: React.FC<RoomCardProps> = ({ listing, t }) => {
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  
  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.AVAILABLE: 
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-teal text-white uppercase tracking-wide shadow-sm">{t('availableNow')}</span>;
      case ListingStatus.TAKEN: 
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gray-200 text-gray-500 uppercase tracking-wide">{t('taken')}</span>;
      case ListingStatus.AVAILABLE_FROM: 
        return <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand-orange text-white uppercase tracking-wide shadow-sm">{t('availableFrom')}: {listing.availableDate}</span>;
      default: return null;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderAmenityIcon = (status: AmenityStatus, icon: React.ReactNode, labelKey: string) => {
    const isAvailable = status !== AmenityStatus.NOT_AVAILABLE;
    const isFree = status === AmenityStatus.FREE;
    
    return (
      <div className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-colors ${!isAvailable ? 'opacity-30' : 'bg-brand-teal/5'}`}>
        <div className={`${isAvailable ? (isFree ? 'text-brand-teal' : 'text-brand-orange') : 'text-gray-400'}`}>
          {icon}
        </div>
        <span className="mt-1 font-medium text-gray-600 hidden sm:block">{t(labelKey)}</span>
      </div>
    );
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanNumber = phone.replace(/\D/g, '');
    const formattedNumber = cleanNumber.startsWith('0') ? '27' + cleanNumber.substring(1) : cleanNumber;
    return `https://wa.me/${formattedNumber}`;
  };

  const getGoogleMapsLink = () => {
    const query = encodeURIComponent(`${listing.address.street}, ${listing.address.suburb}, ${listing.address.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const handleConfirmReport = () => {
    console.log(`Property reported: ${listing.id}`);
    alert("Thank you. This property has been reported for review.");
    setShowReportConfirm(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 relative group overflow-hidden border border-gray-100 flex flex-col h-full">
      
      {/* Report Overlay */}
      {showReportConfirm && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle className="w-8 h-8 text-red-500" />
           </div>
           <h4 className="text-lg font-bold text-gray-900 mb-2">Report Property?</h4>
           <p className="text-sm text-gray-500 mb-6 max-w-[200px]">
             Flag this listing for safety or content issues.
           </p>
           <div className="flex gap-3 w-full">
             <button 
               onClick={() => setShowReportConfirm(false)}
               className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
             >
               Cancel
             </button>
             <button 
               onClick={handleConfirmReport}
               className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
             >
               Report
             </button>
           </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="relative h-56 w-full">
        <div className="absolute inset-0 flex">
            <div className="w-2/3 h-full relative">
                <img src={listing.photos[0]} alt="Interior" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                   {getStatusBadge(listing.status)}
                </div>
            </div>
            <div className="w-1/3 h-full border-l-2 border-white flex flex-col">
                <div className="h-1/2 w-full relative border-b-2 border-white">
                     <img src={listing.photos[1] || listing.photos[0]} alt="Ext" className="w-full h-full object-cover" />
                </div>
                <div className="h-1/2 w-full relative bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                     +{listing.photos.length} more
                </div>
            </div>
        </div>
        
        {/* Rating Badge */}
        {listing.rating > 0 && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                <span className="text-xs font-bold text-gray-800">{listing.rating}</span>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{listing.title}</h3>
                <div className="flex items-center text-gray-500 text-xs font-medium">
                    <MapPin className="w-3 h-3 mr-1 text-brand-teal" />
                    {listing.address.suburb}, {listing.address.city}
                </div>
            </div>
             <div className="text-right">
                <div className="text-2xl font-bold text-brand-teal">R{listing.price}</div>
                <div className="text-[10px] text-gray-400 uppercase font-medium">{t('rentPerMonth')}</div>
            </div>
        </div>

        {/* Safety */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-500 flex items-center">
                    <ShieldCheck className="w-3 h-3 mr-1 text-gray-400"/> {t('safetyRating')}
                </span>
                <span className={`text-xs font-bold ${getSafetyColor(listing.safety)}`}>{listing.safety}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                    className={`h-1.5 rounded-full ${listing.safety > 80 ? 'bg-green-500' : listing.safety > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${listing.safety}%` }}
                ></div>
            </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{listing.description}</p>

        {/* Amenities */}
        <div className="grid grid-cols-5 gap-2 mb-6">
            {renderAmenityIcon(listing.amenities.wifi, <Wifi className="w-4 h-4" />, 'wifi')}
            {renderAmenityIcon(listing.amenities.water, <Droplets className="w-4 h-4" />, 'water')}
            {renderAmenityIcon(listing.amenities.electricity, <Zap className="w-4 h-4" />, 'electricity')}
            {renderAmenityIcon(listing.amenities.bathroom, <Bath className="w-4 h-4" />, 'bathroom')}
            <div className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-colors ${!listing.furnished ? 'opacity-30' : 'bg-brand-teal/5'}`}>
                <div className="text-brand-teal"><Bed className="w-4 h-4" /></div>
                <span className="mt-1 font-medium text-gray-600 hidden sm:block">{t('furnished')}</span>
            </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 mr-2">
                        {listing.landlordName.charAt(0)}
                    </div>
                    <div>
                        <div className="text-xs text-gray-400">Landlord</div>
                        <div className="text-xs font-bold text-gray-700">{listing.landlordName}</div>
                        {listing.landlordIdNumber && (
                           <div className="text-[10px] text-gray-400 mt-0.5 font-mono">ID: {listing.landlordIdNumber}</div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                            WhatsApp: {listing.contactWhatsApp ? 'Available' : 'No'}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setShowReportConfirm(true)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title={t('report')}
                    >
                        <Flag className="w-4 h-4" />
                    </button>
                    <a 
                        href={getGoogleMapsLink()}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-full transition-colors"
                    >
                         <Map className="w-4 h-4" />
                    </a>
                </div>
             </div>

             <div className="flex gap-3">
                {listing.contactWhatsApp && (
                    <a 
                        href={getWhatsAppLink(listing.contactPhone)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 hover:scale-105 w-14 h-12 rounded-xl transition-all shadow-sm border border-green-100"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </a>
                )}
                <a 
                    href={`tel:${listing.contactPhone}`} 
                    className="flex-1 flex items-center justify-center bg-brand-teal hover:bg-brand-teal-dark text-white h-12 rounded-xl text-sm font-bold shadow-lg shadow-brand-teal/30 hover:shadow-brand-teal/40 transition-all hover:-translate-y-0.5"
                >
                    <Phone className="w-4 h-4 mr-2" />
                    {t('callNow')}
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;