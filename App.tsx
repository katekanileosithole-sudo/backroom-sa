import React, { useState, useEffect } from 'react';
import { ViewRole, Listing, Language } from './types';
import { SUBURBS, TRANSLATIONS } from './constants';
import { MockBackend } from './services/mockBackend';
import RoomCard from './components/RoomCard';
import LandlordDashboard from './components/LandlordDashboard';
import MapView from './components/MapView';
import { Search, Home, PlusCircle, Filter, AlertTriangle, Map, List, Globe, CheckCircle2, ChevronRight, Phone, Loader2 } from 'lucide-react';

type PriceRange = 'ALL' | '500-1500' | '1500-2500' | '2500-3500' | '3500-5000';
type ViewMode = 'LIST' | 'MAP';
type AppState = 'PHONE_INPUT' | 'OTP_VERIFY' | 'LANGUAGE_SELECT' | 'ROLE_SELECT' | 'MAIN_APP';

const App: React.FC = () => {
  // App Flow State
  const [appState, setAppState] = useState<AppState>('PHONE_INPUT');
  const [role, setRole] = useState<ViewRole>('HOME');
  
  // Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRange, setPriceRange] = useState<PriceRange>('ALL');
  const [sortOption, setSortOption] = useState('RECENT');
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [language, setLanguage] = useState<Language>('en');

  // Scroll State
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  // Translation helper
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setIsListingsLoading(true);
      try {
        const data = await MockBackend.getListings();
        setListings(data);
      } catch (e) {
        console.error("Failed to load listings", e);
      } finally {
        setIsListingsLoading(false);
      }
    };
    loadData();
  }, []);

  // Handle Scroll to Listing
  useEffect(() => {
    if (viewMode === 'LIST' && scrollToId) {
      // Small timeout to allow the view to switch and DOM to render
      const timer = setTimeout(() => {
        const element = document.getElementById(`listing-${scrollToId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setScrollToId(null);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, scrollToId]);

  const handleAddListing = async (listingData: Omit<Listing, 'id' | 'createdAt'>) => {
    try {
      const newListing = await MockBackend.addListing(listingData);
      setListings(prev => [newListing, ...prev]);
      setRole('HOME'); 
      setAppState('ROLE_SELECT'); // Return to role select or main app
    } catch (error) {
      console.error("Failed to add listing", error);
      alert("Failed to post listing. Please try again.");
    }
  };

  // Auth Handlers
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length > 9) {
      setIsAuthLoading(true);
      await MockBackend.sendOtp(phoneNumber);
      setIsAuthLoading(false);
      setAppState('OTP_VERIFY');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const isValid = await MockBackend.verifyOtp(phoneNumber, otp);
    setIsAuthLoading(false);

    if (isValid) {
      setAppState('LANGUAGE_SELECT');
    } else {
      setOtpError(t('invalidOtp'));
    }
  };

  const handleRoleSelect = (selectedRole: 'TENANT' | 'LANDLORD') => {
    setRole(selectedRole === 'TENANT' ? 'TENANT' : 'LANDLORD');
    setAppState('MAIN_APP');
  };

  const handleMarkerClick = (id: string) => {
    setScrollToId(id);
    setViewMode('LIST');
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter ? listing.address.suburb === locationFilter : true;
    
    let matchesPrice = true;
    switch (priceRange) {
      case '500-1500': matchesPrice = listing.price >= 500 && listing.price <= 1500; break;
      case '1500-2500': matchesPrice = listing.price > 1500 && listing.price <= 2500; break;
      case '2500-3500': matchesPrice = listing.price > 2500 && listing.price <= 3500; break;
      case '3500-5000': matchesPrice = listing.price > 3500 && listing.price <= 5000; break;
      default: matchesPrice = true;
    }
    
    return matchesSearch && matchesLocation && matchesPrice;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'PRICE_ASC': return a.price - b.price;
      case 'PRICE_DESC': return b.price - a.price;
      case 'SAFETY': return b.safety - a.safety;
      case 'RECENT': default: return b.createdAt - a.createdAt;
    }
  });

  // --- Components ---

  const Logo = ({ large = false }: { large?: boolean }) => (
    <div className={`flex items-center justify-center font-bold text-brand-dark ${large ? 'text-4xl gap-3' : 'text-xl gap-2'}`}>
      <div className="relative">
        <Home className={`${large ? 'w-10 h-10' : 'w-6 h-6'} text-brand-teal fill-brand-teal/10`} />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span>BackRoom</span>
        {large && <span className="text-sm font-medium text-brand-orange mt-1 uppercase tracking-wider">Hlala Nathi</span>}
      </div>
    </div>
  );

  const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zu', label: 'isiZulu' },
    { code: 'xh', label: 'isiXhosa' },
    { code: 'nso', label: 'Sepedi' },
    { code: 'st', label: 'Sesotho' },
    { code: 'tn', label: 'Setswana' },
    { code: 'ts', label: 'Xitsonga' },
    { code: 'ss', label: 'siSwati' },
    { code: 've', label: 'Tshivenda' },
    { code: 'nr', label: 'isiNdebele' },
  ];

  const LanguageSelector = () => (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md h-[400px] overflow-y-auto pr-1 pb-4 custom-scrollbar">
      {LANGUAGES.map(lang => (
        <button 
          key={lang.code}
          onClick={() => { setLanguage(lang.code); setAppState('ROLE_SELECT'); }}
          className="flex items-center justify-center py-4 px-6 rounded-2xl bg-white border-2 border-brand-gray hover:border-brand-teal hover:bg-brand-teal/5 transition-all text-brand-dark font-medium shadow-sm hover:shadow-md"
        >
          {lang.label}
        </button>
      ))}
    </div>
  );

  // --- Views ---

  if (appState === 'PHONE_INPUT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light px-6 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <Logo />
            <h2 className="text-2xl font-bold mt-6 text-brand-teal">{t('welcome')}</h2>
            <p className="text-gray-500 mt-2">{t('enterPhone')}</p>
          </div>
          
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-6 relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="tel" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brand-gray focus:border-brand-teal focus:ring-0 outline-none text-lg bg-gray-50 transition-colors"
                placeholder={t('phonePlaceholder')}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isAuthLoading}
              className="w-full py-4 bg-brand-teal text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-brand-teal-dark transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <>{t('sendOtp')} <ChevronRight className="ml-2 w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (appState === 'OTP_VERIFY') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light px-6 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-teal">
                <CheckCircle2 className="w-8 h-8" />
             </div>
            <h2 className="text-2xl font-bold text-brand-teal">{t('enterOtp')}</h2>
            <p className="text-gray-500 mt-2">Code sent to {phoneNumber}</p>
          </div>
          
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-6">
              <input 
                type="text" 
                maxLength={4}
                required
                className="w-full text-center py-4 rounded-xl border-2 border-brand-gray focus:border-brand-teal focus:ring-0 outline-none text-3xl tracking-widest bg-gray-50 transition-colors font-mono"
                placeholder="0000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
              />
              {otpError && <p className="text-red-500 text-sm text-center mt-2">{otpError}</p>}
            </div>
            <button 
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isAuthLoading ? <Loader2 className="animate-spin w-5 h-5" /> : t('verify')}
            </button>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => setOtpError('')} className="text-brand-teal font-medium text-sm">{t('resend')}</button>
          </div>
          <button onClick={() => setAppState('PHONE_INPUT')} className="w-full mt-4 text-sm text-gray-400 hover:text-brand-dark">{t('back')}</button>
        </div>
      </div>
    );
  }

  if (appState === 'LANGUAGE_SELECT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light px-6 py-12">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Logo large />
        </div>
        <h2 className="text-xl font-semibold text-brand-dark mb-6">Select Language / Khetha Ulimi</h2>
        <LanguageSelector />
      </div>
    );
  }

  if (appState === 'ROLE_SELECT') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-light px-6 py-12">
         <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-brand-dark mb-2">Who are you?</h1>
            <p className="text-gray-500">Choose your role to continue</p>
         </div>

         <div className="grid gap-6 w-full max-w-md">
            <button 
              onClick={() => handleRoleSelect('TENANT')}
              className="relative group overflow-hidden bg-white p-6 rounded-3xl border-2 border-transparent hover:border-brand-orange shadow-soft hover:shadow-xl transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Search className="w-24 h-24 text-brand-orange" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-4 text-brand-orange">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">{t('tenantRole')}</h3>
                <p className="text-gray-500 text-sm">{t('tenantDesc')}</p>
              </div>
            </button>

            <button 
              onClick={() => handleRoleSelect('LANDLORD')}
              className="relative group overflow-hidden bg-white p-6 rounded-3xl border-2 border-transparent hover:border-brand-teal shadow-soft hover:shadow-xl transition-all text-left"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlusCircle className="w-24 h-24 text-brand-teal" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-4 text-brand-teal">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">{t('landlordRole')}</h3>
                <p className="text-gray-500 text-sm">{t('landlordDesc')}</p>
              </div>
            </button>
         </div>
      </div>
    );
  }

  // --- Main App Logic ---

  if (role === 'LANDLORD') {
    return (
      <LandlordDashboard 
        onAddRoom={handleAddListing} 
        onBack={() => setRole('HOME')} 
        isDarkMode={false}
        onToggleTheme={() => {}}
        t={t}
      />
    );
  }

  if (role === 'HOME') {
     setAppState('ROLE_SELECT');
     return null; 
  }

  // Tenant View
  return (
    <div className="min-h-screen pb-24 bg-brand-light">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="bg-brand-orange text-white px-4 py-2 text-center text-[11px] font-bold tracking-wide flex items-center justify-center">
             <AlertTriangle className="w-3 h-3 mr-2 text-white fill-current" />
             {t('safeRenting')}
        </div>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
           <Logo />
           <div className="flex items-center gap-2">
             <button onClick={() => setAppState('ROLE_SELECT')} className="text-xs font-semibold text-gray-500 hover:text-brand-teal px-3 py-1.5 rounded-full bg-gray-100 hover:bg-brand-teal/10 transition-colors">
                {t('switchRole')}
             </button>
             <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center font-bold text-xs">
                {language.toUpperCase()}
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl shadow-soft mb-8">
           <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-teal/20 focus:bg-white outline-none text-brand-dark placeholder-gray-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <select 
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm min-w-[130px] text-gray-700 focus:border-brand-teal outline-none"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">{t('allLocations')}</option>
                {SUBURBS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <select 
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm min-w-[140px] text-gray-700 focus:border-brand-teal outline-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="RECENT">{t('newest')}</option>
                <option value="PRICE_ASC">{t('priceLow')}</option>
                <option value="PRICE_DESC">{t('priceHigh')}</option>
                <option value="SAFETY">{t('safety')}</option>
              </select>

              <select 
                 className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm min-w-[140px] text-gray-700 focus:border-brand-teal outline-none"
                 value={priceRange}
                 onChange={(e) => setPriceRange(e.target.value as PriceRange)}
              >
                <option value="ALL">All Prices</option>
                <option value="500-1500">R500 - R1500</option>
                <option value="1500-2500">R1500 - R2500</option>
                <option value="2500-3500">R2500 - R3500</option>
                <option value="3500-5000">R3500 - R5000</option>
              </select>
            </div>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-end mb-6">
           <div>
              <h2 className="text-2xl font-bold text-brand-dark">{t('results')}</h2>
              <p className="text-gray-500 text-sm">
                {isListingsLoading ? 'Loading...' : `${filteredListings.length} rooms available`}
              </p>
           </div>
           <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <button 
                    onClick={() => setViewMode('LIST')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'LIST' ? 'bg-brand-teal text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                    <List className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setViewMode('MAP')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'MAP' ? 'bg-brand-teal text-white shadow-md' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                    <Map className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Content */}
        {isListingsLoading ? (
           <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-brand-teal animate-spin mb-4" />
              <p className="text-gray-400">Finding rooms...</p>
           </div>
        ) : (
          <>
            {viewMode === 'LIST' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map(listing => (
                  <div key={listing.id} id={`listing-${listing.id}`} className="h-full">
                    <RoomCard listing={listing} t={t} />
                  </div>
                ))}
              </div>
            ) : (
              <MapView listings={filteredListings} onMarkerClick={handleMarkerClick} />
            )}

            {filteredListings.length === 0 && (
              <div className="text-center py-20">
                <Filter className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                <p className="text-gray-500 mb-4">{t('noResults')}</p>
                <button onClick={() => {setSearchTerm(''); setLocationFilter(''); setPriceRange('ALL'); setSortOption('RECENT')}} className="text-brand-teal font-bold hover:underline">
                  {t('clearFilters')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;