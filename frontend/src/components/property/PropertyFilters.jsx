import React, { useState } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

const TYPES = ['Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'];
const FURNISHED = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

export default function PropertyFilters({ filters, onChange, onReset }) {
  const [showMore, setShowMore] = useState(false);

  const handle = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="glass-card p-5 mb-6">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by keyword, city..."
            className="input-field pl-9"
            value={filters.keyword || ''}
            onChange={e => handle('keyword', e.target.value)}
          />
        </div>
        <select className="input-field sm:w-48" value={filters.sort || 'newest'} onChange={e => handle('sort', e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 btn-secondary text-sm whitespace-nowrap">
          <FiFilter size={14} /> {showMore ? 'Less Filters' : 'More Filters'}
        </button>
        <button onClick={onReset} className="text-gray-400 hover:text-red-500 transition-colors">
          <FiX size={18} />
        </button>
      </div>

      {/* Quick type filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handle('property_type', '')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filters.property_type ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'}`}
        >
          All Types
        </button>
        {TYPES.map(t => (
          <button key={t} onClick={() => handle('property_type', t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.property_type === t ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {showMore && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-gray-100">
          <div>
            <label className="label">City</label>
            <input type="text" className="input-field" placeholder="Mumbai..." value={filters.city || ''} onChange={e => handle('city', e.target.value)} />
          </div>
          <div>
            <label className="label">Min Price (₹)</label>
            <input type="number" className="input-field" placeholder="500000" value={filters.min_price || ''} onChange={e => handle('min_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Max Price (₹)</label>
            <input type="number" className="input-field" placeholder="5000000" value={filters.max_price || ''} onChange={e => handle('max_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <select className="input-field" value={filters.bedrooms || ''} onChange={e => handle('bedrooms', e.target.value)}>
              <option value="">Any</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <select className="input-field" value={filters.bathrooms || ''} onChange={e => handle('bathrooms', e.target.value)}>
              <option value="">Any</option>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
          <div>
            <label className="label">Furnished</label>
            <select className="input-field" value={filters.furnished || ''} onChange={e => handle('furnished', e.target.value)}>
              <option value="">Any</option>
              {FURNISHED.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
