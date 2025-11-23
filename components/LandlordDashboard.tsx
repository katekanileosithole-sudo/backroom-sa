import React, { useState } from 'react';
import { AmenityStatus, Listing, ListingStatus, Address } from '../types';
import { SUBURBS } from '../constants';
import { generateRoomDescription } from '../services/geminiService';
import { Sparkles, Loader2, Camera, Plus, MessageCircle, Lock, ArrowLeft, Home } from 'lucide-react';

interface LandlordDashboardProps {
  onAddRoom: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<void>;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  t: (key: string) => string;
}

const LandlordDashboard: React.FC<LandlordDashboardProps> = ({ onAddRoom, onBack, t }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    street: '',
    suburb: SUBURBS[0],
    city: 'Johannesburg', // Default
    price: '',
    deposit: '',
    description: '',
    safety: 70,
    landlordName: '',
    contactPhone: '',
    contactWhatsApp: false,
    landlordIdNumber: '',
    amenities: {
      wifi: AmenityStatus.NOT_AVAILABLE,
      water: AmenityStatus.FREE,
      electricity: AmenityStatus.PAID,
      bathroom: AmenityStatus.FREE,
    },
    beds: 1,
    baths: 1,
    furnished: false,
    status: ListingStatus.AVAILABLE,
    availableDate: '',
  });

  const handleAmenityChange = (key: keyof typeof form.amenities, value: any) => {
    setForm(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: value }
    }));
  };

  const handleAutoGenerate = async () => {
    if (!form.title || !form.price) {
      alert("Please enter a Residence Name and Price first.");
      return;
    }
    setIsGenerating(true);
    const address: Address = {
        street: form.street,
        suburb: form.suburb,
        city: form.city,
        province: 'Gauteng',
        lat: -26.2, 
        lng: 28.0 
    };
    
    const desc = await generateRoomDescription({
      title: form.title,
      address: address,
      price: Number(form.price),
      amenities: form.amenities
    });
    setForm(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Generate random mock coordinates near the suburb
    const address: Address = {
        street: form.street,
        suburb: form.suburb,
        city: form.city,
        province: 'Gauteng',
        lat: -26.2041 + (Math.random() * 0.1 - 0.05),
        lng: 28.0473 + (Math.random() * 0.1 - 0.05)
    };

    const newListingData: Omit<Listing, 'id' | 'createdAt'> = {
      title: form.title,
      address,
      price: Number(form.price),
      deposit: Number(form.deposit) || 0,
      description: form.description,
      safety: form.safety,
      rating: 0,
      landlordId: `user-${Date.now()}`,
      landlordName: form.landlordName,
      contactPhone: form.contactPhone,
      contactWhatsApp: form.contactWhatsApp,
      landlordIdNumber: form.landlordIdNumber,
      status: form.status,
      availableDate: form.availableDate,
      photos: [
        `https://images.unsplash.com/photo-1526308593555-539923361e60?auto=format&fit=crop&w=800&q=60`,
        `https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=60`,
      ],
      amenities: form.amenities,
      beds: form.beds,
      baths: form.baths,
      furnished: form.furnished,
    };
    
    await onAddRoom(newListingData);
    setIsSubmitting(false);
    // Success alert is handled in App.tsx or we can redirect
  };

  return (
    <div className="min-h-screen bg-brand-light pb-20">
      <div className="bg-brand-dark text-white p-6 pb-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
              <Plus className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
             <button onClick={onBack} className="flex items-center text-white/70 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> {t('back')}
             </button>
             <h1 className="text-3xl font-bold mb-2">{t('listRoom')}</h1>
             <p className="text-white/60">Fill in the details below to post your property.</p>
          </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-20">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-8">
            
            {/* Section: Basic Info */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-dark flex items-center border-b pb-2">
                    <Home className="w-5 h-5 mr-2 text-brand-teal" /> Property Details
                </h3>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('resName')}</label>
                    <input required type="text" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl outline-none transition-all" placeholder="e.g. Mama Jack's Rooms" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Suburb</label>
                        <div className="relative">
                            <select className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl outline-none appearance-none transition-all" value={form.suburb} onChange={e => setForm({...form, suburb: e.target.value})}>
                                {SUBURBS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('street')}</label>
                        <input required type="text" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl outline-none transition-all" placeholder="e.g 123 Vilakazi St" value={form.street} onChange={e => setForm({...form, street: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Section: Financials */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-brand-dark border-b pb-2">Financials</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('price')} (R)</label>
                        <input required type="number" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl outline-none transition-all font-mono text-lg" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('deposit')} (R)</label>
                        <input type="number" className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl outline-none transition-all font-mono text-lg" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Section: Amenities */}
            <div className="bg-brand-teal/5 p-6 rounded-2xl border border-brand-teal/10">
                <h3 className="text-sm font-bold text-brand-teal uppercase tracking-wider mb-4">Amenities Included?</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">{t('wifi')}</label>
                        <select className="text-sm p-2 rounded-lg border-gray-200" value={form.amenities.wifi} onChange={e => handleAmenityChange('wifi', e.target.value)}>
                            <option value={AmenityStatus.FREE}>Free</option>
                            <option value={AmenityStatus.PAID}>Paid</option>
                            <option value={AmenityStatus.NOT_AVAILABLE}>No</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">{t('electricity')}</label>
                        <select className="text-sm p-2 rounded-lg border-gray-200" value={form.amenities.electricity} onChange={e => handleAmenityChange('electricity', e.target.value)}>
                            <option value={AmenityStatus.FREE}>Free</option>
                            <option value={AmenityStatus.PAID}>Prepaid</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">{t('water')}</label>
                        <select className="text-sm p-2 rounded-lg border-gray-200" value={form.amenities.water} onChange={e => handleAmenityChange('water', e.target.value)}>
                            <option value={AmenityStatus.FREE}>Free</option>
                            <option value={AmenityStatus.PAID}>Paid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Section: Description */}
            <div>
                 <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <button 
                        type="button" 
                        onClick={handleAutoGenerate}
                        disabled={isGenerating}
                        className="flex items-center text-xs text-brand-orange font-bold bg-brand-orange/10 px-3 py-1.5 rounded-full hover:bg-brand-orange/20 transition-colors"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1"/> : <Sparkles className="w-3 h-3 mr-1"/>}
                        {t('aiGenerate')}
                    </button>
                </div>
                <textarea 
                    className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-brand-teal rounded-xl h-32 outline-none transition-all" 
                    placeholder={t('descPlaceholder')}
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})}
                />
            </div>

            {/* Section: Landlord Info */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                 <h3 className="text-lg font-bold text-brand-dark mb-4">{t('landlordDetails')}</h3>
                 <div className="space-y-4">
                    <input required type="text" placeholder="Your Name" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-brand-teal outline-none" value={form.landlordName} onChange={e => setForm({...form, landlordName: e.target.value})} />
                    <input required type="tel" placeholder="Phone Number" className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-brand-teal outline-none" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} />
                    
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <input required type="text" placeholder="ID Number (Private)" className="flex-1 outline-none text-sm" value={form.landlordIdNumber} onChange={e => setForm({...form, landlordIdNumber: e.target.value})} />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 accent-green-600" checked={form.contactWhatsApp} onChange={e => setForm({...form, contactWhatsApp: e.target.checked})} />
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                            <MessageCircle className="w-4 h-4 text-green-500 mr-1" /> Available on WhatsApp
                        </span>
                    </label>
                 </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-5 bg-brand-teal hover:bg-brand-teal-dark text-white rounded-2xl font-bold text-xl shadow-lg hover:shadow-brand-teal/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Plus className="w-6 h-6 mr-2" />}
                {isSubmitting ? 'Posting...' : t('postListing')}
            </button>
        </form>
      </div>
    </div>
  );
};

export default LandlordDashboard;