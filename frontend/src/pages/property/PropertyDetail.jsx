import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiDroplet, FiMaximize, FiMapPin, FiHeart, FiShare2,
  FiCalendar, FiEye, FiCheckCircle, FiPhone, FiMail, FiCpu
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { propertyService } from '../../services/api';
import { formatPrice, formatArea, formatDate, getStatusColor, getPropertyTypeIcon } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import InquiryForm from '../../components/property/InquiryForm';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await propertyService.getById(id);
        setProperty(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!property) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🏠</div>
      <h2 className="text-xl font-bold text-gray-700">Property not found</h2>
      <Link to="/properties" className="btn-primary mt-4 inline-block text-sm">Back to listings</Link>
    </div>
  );

  const images = property.images || [];
  const wishlisted = isWishlisted(property.id);

  const features = [
    { label: 'Bedrooms', value: property.bedrooms, icon: FiHome },
    { label: 'Bathrooms', value: property.bathrooms, icon: FiDroplet },
    { label: 'Area', value: formatArea(property.area_sqft), icon: FiMaximize },
    { label: 'Floor', value: property.floor, icon: null },
    { label: 'Parking', value: property.parking, icon: null },
    { label: 'Age', value: `${property.age_years} yrs`, icon: FiCalendar },
    { label: 'Furnished', value: property.furnished, icon: null },
    { label: 'Facing', value: property.facing, icon: null },
  ];

  const nearby = [
    property.nearby_schools > 0 && `${property.nearby_schools} Schools`,
    property.nearby_hospital > 0 && `${property.nearby_hospital} Hospitals`,
    property.nearby_metro > 0 && `${property.nearby_metro} Metro Stations`,
    property.nearby_mall && 'Mall',
    property.nearby_airport && 'Airport',
  ].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-700">Home</Link> /
        <Link to="/properties" className="hover:text-primary-700">Properties</Link> /
        <span className="text-gray-800 truncate">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: images + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="glass-card overflow-hidden">
            <div className="relative h-72 md:h-96 bg-gradient-to-br from-purple-50 to-purple-100">
              {images.length > 0 ? (
                <img src={images[activeImg]?.image_url || images[activeImg]?.url}
                  alt={property.title}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  {getPropertyTypeIcon(property.property_type)}
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`badge ${getStatusColor(property.status)} capitalize`}>{property.status}</span>
                <span className="badge badge-purple">{property.property_type}</span>
              </div>
            </div>
            {images.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-600' : 'border-transparent'}`}>
                    <img src={img.image_url || img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price */}
          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <FiMapPin size={13} /> {property.address}, {property.city}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FiEye size={11} /> {property.views_count} views</span>
                  <span>{formatDate(property.created_at)}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-primary-700">{formatPrice(property.price)}</div>
                {property.ai_estimated_price && (
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                    <FiCpu size={10} /> AI: {formatPrice(property.ai_estimated_price)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{f.value || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map(a => (
                  <span key={a} className="flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-3 py-1.5 rounded-full">
                    <FiCheckCircle size={11} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby */}
          {nearby.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Nearby Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {nearby.map(n => (
                  <span key={n} className="bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-full">{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <MapContainer
                center={[property.latitude, property.longitude]}
                zoom={15} style={{ height: '280px', borderRadius: '12px' }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[property.latitude, property.longitude]}>
                  <Popup>{property.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* Right: Seller info + inquiry */}
        <div className="space-y-5">
          {/* Seller card */}
          {property.seller && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Listed by</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                  {property.seller.first_name?.[0] || 'S'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {property.seller.first_name} {property.seller.last_name}
                  </p>
                  <p className="text-xs text-gray-400">Seller</p>
                </div>
              </div>
              {property.seller.phone && (
                <a href={`tel:${property.seller.phone}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700 mb-2">
                  <FiPhone size={13} /> {property.seller.phone}
                </a>
              )}
              {property.seller.email && (
                <a href={`mailto:${property.seller.email}`}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700">
                  <FiMail size={13} /> {property.seller.email}
                </a>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="glass-card p-5 space-y-3">
            {user?.role === 'buyer' ? (
              <button onClick={() => setInquiryOpen(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <FiMail size={15} /> Send Inquiry
              </button>
            ) : !user ? (
              <Link to="/login" className="btn-primary block text-center">Login to Inquire</Link>
            ) : null}

            {(!user || user?.role === 'buyer') && (
              <button onClick={() => toggle(property)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all
                  ${wishlisted ? 'border-red-400 text-red-500 bg-red-50 hover:bg-red-100' : 'border-primary-200 text-primary-700 hover:bg-primary-50'}`}>
                <FiHeart size={15} className={wishlisted ? 'fill-red-500' : ''} />
                {wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              </button>
            )}

            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}>
              <FiShare2 size={14} /> Share Property
            </button>
          </div>

          {/* AI Price Comparison */}
          {property.ai_estimated_price && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiCpu size={15} className="text-primary-600" /> AI Analysis
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Listed Price</span>
                  <span className="font-semibold">{formatPrice(property.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">AI Estimate</span>
                  <span className="font-semibold text-primary-700">{formatPrice(property.ai_estimated_price)}</span>
                </div>
                {(() => {
                  const diff = ((property.price - property.ai_estimated_price) / property.ai_estimated_price) * 100;
                  const cls = Math.abs(diff) < 10 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-blue-600';
                  const label = Math.abs(diff) < 10 ? '✓ Fair Price' : diff > 0 ? '↑ Above Market' : '↓ Below Market';
                  return (
                    <div className={`text-xs font-semibold ${cls} mt-2 p-2 rounded-lg bg-gray-50`}>
                      {label} ({diff > 0 ? '+' : ''}{diff.toFixed(1)}%)
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} title="Send Inquiry">
        <InquiryForm property={property} onClose={() => setInquiryOpen(false)} />
      </Modal>
    </div>
  );
}
