import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyFilters from '../../components/property/PropertyFilters';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import { propertyService } from '../../services/api';

const DEFAULT_FILTERS = {
  keyword: '', city: '', property_type: '', min_price: '',
  max_price: '', bedrooms: '', bathrooms: '', furnished: '', sort: 'newest'
};

export default function PropertyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    city: searchParams.get('city') || '',
    property_type: searchParams.get('property_type') || '',
    keyword: searchParams.get('keyword') || '',
  }));

  const totalPages = Math.ceil(total / 12);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await propertyService.getAll(params);
      setProperties(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-4">
        <div>
          <h1 className="page-header">Browse Properties</h1>
          <p className="page-sub mb-0">Discover top verified listings across India with AI valuation insights</p>
        </div>
        <div className="bg-purple-50 text-primary-700 font-bold text-xs px-3 py-1.5 rounded-full border border-purple-100/80 self-start sm:self-auto">
          {total} {total === 1 ? 'Property' : 'Properties'} Available
        </div>
      </div>

      <PropertyFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No properties found</h3>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
          <button onClick={handleReset} className="btn-primary mt-4 text-sm">Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {properties.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
