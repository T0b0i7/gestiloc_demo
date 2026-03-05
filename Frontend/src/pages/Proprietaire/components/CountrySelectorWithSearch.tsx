import React, { useState, useMemo } from 'react';
import { countries } from '../data/countries';

interface CountrySelectorWithSearchProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  showPhonePrefix?: boolean;
  title?: string;
  ariaLabel?: string;
}

export const CountrySelectorWithSearch: React.FC<CountrySelectorWithSearchProps> = ({
  value,
  onChange,
  label,
  showPhonePrefix = false,
  title,
  ariaLabel
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    return countries.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedCountry = countries.find(c => c.name === value);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 transition-colors"
          title={title}
          aria-label={ariaLabel}
        >
          <span className="flex items-center gap-2">
            {selectedCountry && <span className="text-lg">{selectedCountry.flag}</span>}
            <span>{selectedCountry ? selectedCountry.name : 'Choisir'}</span>
          </span>
          <span className="text-slate-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50">
            {/* Search input */}
            <div className="p-3 border-b border-slate-200">
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Countries list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-slate-500 text-sm">
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      onChange(country.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-b-0 ${
                      selectedCountry?.code === country.code ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-slate-900">{country.name}</span>
                    <span className="text-xs text-slate-500">{country.code}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Liste des pays avec indicatifs téléphoniques
const countriesWithPhoneCodes = [
  { name: 'France', flag: '🇫🇷', code: '33' },
  { name: 'Belgique', flag: '🇧🇪', code: '32' },
  { name: 'Suisse', flag: '🇨🇭', code: '41' },
  { name: 'Luxembourg', flag: '🇱🇺', code: '352' },
  { name: 'Canada', flag: '🇨🇦', code: '1' },
  { name: 'Allemagne', flag: '🇩🇪', code: '49' },
  { name: 'Italie', flag: '🇮🇹', code: '39' },
  { name: 'Espagne', flag: '🇪🇸', code: '34' },
  { name: 'Portugal', flag: '🇵🇹', code: '351' },
  { name: 'Pays-Bas', flag: '🇳🇱', code: '31' },
  { name: 'Royaume-Uni', flag: '🇬🇧', code: '44' },
  { name: 'Irlande', flag: '🇮🇪', code: '353' },
  { name: 'Suède', flag: '🇸🇪', code: '46' },
  { name: 'Norvège', flag: '🇳🇴', code: '47' },
  { name: 'Danemark', flag: '🇩🇰', code: '45' },
  { name: 'Finlande', flag: '🇫🇮', code: '358' },
  { name: 'Pologne', flag: '🇵🇱', code: '48' },
  { name: 'République tchèque', flag: '🇨🇿', code: '420' },
  { name: 'Autriche', flag: '🇦🇹', code: '43' },
  { name: 'Grèce', flag: '🇬🇷', code: '30' },
  { name: 'Roumanie', flag: '🇷🇴', code: '40' },
  { name: 'Hongrie', flag: '🇭🇺', code: '36' },
  { name: 'États-Unis', flag: '🇺🇸', code: '1' },
  { name: 'Mexique', flag: '🇲🇽', code: '52' },
  { name: 'Brésil', flag: '🇧🇷', code: '55' },
  { name: 'Argentine', flag: '🇦🇷', code: '54' },
  { name: 'Australie', flag: '🇦🇺', code: '61' },
  { name: 'Japon', flag: '🇯🇵', code: '81' },
  { name: 'Chine', flag: '🇨🇳', code: '86' },
  { name: 'Inde', flag: '🇮🇳', code: '91' },
  { name: 'Thaïlande', flag: '🇹🇭', code: '66' },
  { name: 'Singapour', flag: '🇸🇬', code: '65' },
];

interface PhoneCountrySelectorProps {
  countryName: string;
  onCountryChange: (name: string) => void;
  phoneValue: string;
  onPhoneChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
}

export const PhoneCountrySelector: React.FC<PhoneCountrySelectorProps> = ({
  countryName,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  placeholder = '12 34 56 78',
  title,
  ariaLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = countriesWithPhoneCodes.find(c => c.name === countryName) || countriesWithPhoneCodes[0];

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countriesWithPhoneCodes;
    return countriesWithPhoneCodes.filter(country =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex gap-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-3 py-2.5 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Sélectionner le pays"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-slate-600 ml-2 font-medium">+{selectedCountry.code}</span>
          <span className="ml-1 text-xs text-slate-400">▼</span>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 min-w-[280px]">
            {/* Search input */}
            <div className="p-2 border-b border-slate-200">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>

            {/* Countries list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-3 text-center text-slate-500 text-sm">
                  Aucun pays trouvé
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      onCountryChange(country.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors flex items-center gap-2 border-b border-slate-100 last:border-b-0 text-sm ${
                      selectedCountry.code === country.code ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-base">{country.flag}</span>
                    <span className="flex-1 text-slate-900">{country.name}</span>
                    <span className="text-xs text-slate-500">+{country.code}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <input
        type="tel"
        placeholder={placeholder}
        value={phoneValue}
        onChange={(e) => onPhoneChange(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={title}
        aria-label={ariaLabel}
      />
    </div>
  );
};

interface PhoneInputProps {
  countryName: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  title?: string;
  ariaLabel?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryName,
  value,
  onChange,
  placeholder = '12 34 56 78',
  title,
  ariaLabel
}) => {
  const country = countriesWithPhoneCodes.find(c => c.name === countryName) || countriesWithPhoneCodes[0];

  return (
    <div className="flex gap-2">
      <div className="flex items-center px-3 border border-slate-300 rounded-lg bg-white min-w-fit">
        <span className="text-lg">{country.flag}</span>
        <span className="text-slate-600 ml-2 text-sm font-medium">+{country.code}</span>
      </div>
      <input
        type="tel"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={title}
        aria-label={ariaLabel}
      />
    </div>
  );
};
