import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiDroplet, FiMaximize, FiMapPin, FiHeart, FiEye, FiCpu } from 'react-icons/fi';
import { formatPrice, formatArea, getStatusColor, getPropertyTypeIcon } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';

export default function PropertyCard({ property }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(property.id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggle(property);
  };

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(124,58,237,0.22)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card overflow-hidden group border border-purple-100/70 hover:border-purple-300 flex flex-col justify-between"
    >
      <Link to={`/properties/${property.id}`} className="block h-full flex flex-col">
        {/* Image & Floating Overlay */}
        <div className="relative h-52 bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 overflow-hidden">
          {property.primary_image ? (
            <img
              src={property.primary_image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-80 group-hover:scale-110 transition-transform duration-500">
              {getPropertyTypeIcon(property.property_type)}
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className={`badge ${getStatusColor(property.status)} capitalize shadow-sm backdrop-blur-md`}>
              {property.status}
            </span>
          </div>

          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-primary-800 text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm border border-white/80">
            {property.property_type}
          </div>

          {/* Wishlist Button */}
          {(!user || user?.role === 'buyer') && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleWishlist}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md z-10
                ${wishlisted ? 'bg-rose-500 text-white shadow-rose-500/40' : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white'}`}
            >
              <FiHeart size={15} className={wishlisted ? 'fill-white' : ''} />
            </motion.button>
          )}

          {/* AI valuation badge if present */}
          {property.ai_estimated_price && (
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/30">
              <FiCpu size={12} className="text-emerald-400 animate-pulse" />
              AI: {formatPrice(property.ai_estimated_price)}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-primary-700 transition-colors truncate mb-1">
              {property.title}
            </h3>

            <div className="flex items-center gap-1 text-slate-400 text-xs mb-3 font-medium">
              <FiMapPin size={12} className="text-primary-500 flex-shrink-0" />
              <span className="truncate">{property.address ? `${property.address}, ` : ''}{property.city}</span>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-3 gap-1.5 bg-purple-50/60 rounded-xl p-2 mb-4 text-xs font-semibold text-slate-600 border border-purple-100/50">
              <div className="flex items-center justify-center gap-1 truncate">
                <FiHome size={12} className="text-primary-600" />
                <span>{property.bedrooms || '—'} Bed</span>
              </div>
              <div className="flex items-center justify-center gap-1 truncate border-x border-purple-100">
                <FiDroplet size={12} className="text-primary-600" />
                <span>{property.bathrooms || '—'} Bath</span>
              </div>
              <div className="flex items-center justify-center gap-1 truncate">
                <FiMaximize size={12} className="text-primary-600" />
                <span>{formatArea(property.area_sqft)}</span>
              </div>
            </div>
          </div>

          {/* Price & Views */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-400 font-medium">Listed Price</p>
              <span className="text-lg font-extrabold text-primary-700 tracking-tight">
                {formatPrice(property.price)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs bg-slate-100/80 px-2.5 py-1 rounded-full font-medium">
              <FiEye size={12} className="text-slate-500" /> {property.views_count || 0}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
