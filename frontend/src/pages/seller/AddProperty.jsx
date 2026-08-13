import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { propertyService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';

const TYPES = ['Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'];
const FURNISHED = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const FACING = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
const AMENITIES = [
  'Swimming Pool', 'Gym', 'Lift', 'Security', 'Power Backup',
  'Garden', 'Club House', 'Play Area', 'CCTV', 'Intercom',
  'Rainwater Harvesting', 'Solar Energy', 'Gas Pipeline', 'Fire Safety',
];

export default function AddProperty() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      property_type: 'Apartment',
      furnished: 'Unfurnished',
      facing: 'North',
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      floor: 0,
      age_years: 0,
      balcony: 0,
      water_supply: true,
      electricity: true,
      nearby_schools: 0,
      nearby_hospital: 0,
      nearby_metro: 0,
      location_score: 5,
      road_width: 20,
      // Pre-fill estimated price if coming from AI estimator
      price: location.state?.estimated_price || '',
    },
  });

  const handleImageSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    setImages(prev => {
      const merged = [...prev, ...files].slice(0, 10);
      setPreviews(merged.map(f => URL.createObjectURL(f)));
      return merged;
    });
  }, []);

  const removeImage = useCallback((idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // Fix: prevent scroll-to-top on amenity toggle
  const toggleAmenity = useCallback((a) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      fd.append('amenities', JSON.stringify(selectedAmenities));
      images.forEach(img => fd.append('images', img));
      await propertyService.create(fd);
      toast.success('Property listed successfully!');
      navigate('/seller/properties');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, error, children }) => (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="page-header">Add Property</h1>
        <p className="page-sub">Fill in the details to list your property</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Section title="Basic Information">
          <div className="space-y-4">
            <Field label="Title *" error={errors.title?.message}>
              <input className="input-field" placeholder="e.g. Spacious 3BHK Apartment in Bandra"
                {...register('title', { required: 'Title is required' })} />
            </Field>
            <Field label="Description *" error={errors.description?.message}>
              <textarea rows={4} className="input-field resize-none"
                placeholder="Describe the property..."
                {...register('description', { required: 'Description is required' })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Property Type">
                <select className="input-field" {...register('property_type')}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className="input-field" {...register('status')}>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* Pricing & Size */}
        <Section title="Pricing & Size">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹) *" error={errors.price?.message}>
              <input type="number" className="input-field" placeholder="5000000"
                {...register('price', { required: 'Price required', min: { value: 1, message: 'Must be > 0' } })} />
            </Field>
            <Field label="Area (sqft) *" error={errors.area_sqft?.message}>
              <input type="number" className="input-field" placeholder="1200"
                {...register('area_sqft', { required: 'Area required', min: 1 })} />
            </Field>
          </div>
        </Section>

        {/* Property Details */}
        <Section title="Property Details">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Bedrooms',           name: 'bedrooms',       min: 0 },
              { label: 'Bathrooms',           name: 'bathrooms',      min: 0 },
              { label: 'Balcony',             name: 'balcony',        min: 0 },
              { label: 'Parking',             name: 'parking',        min: 0 },
              { label: 'Floor',               name: 'floor',          min: 0 },
              { label: 'Age (years)',          name: 'age_years',      min: 0 },
              { label: 'Road Width (ft)',      name: 'road_width',     min: 0 },
              { label: 'Location Score (1-10)',name: 'location_score', min: 1, max: 10, step: 0.01 },
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input type="number" className="input-field" min={f.min} max={f.max} step={f.step || 1}
                  {...register(f.name, { valueAsNumber: true })} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Field label="Furnished">
              <select className="input-field" {...register('furnished')}>
                {FURNISHED.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Facing">
              <select className="input-field" {...register('facing')}>
                {FACING.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-primary-700" defaultChecked {...register('water_supply')} />
              Water Supply
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-primary-700" defaultChecked {...register('electricity')} />
              Electricity
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-primary-700" {...register('nearby_mall')} />
              Nearby Mall
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded text-primary-700" {...register('nearby_airport')} />
              Nearby Airport
            </label>
          </div>
        </Section>

        {/* Nearby Facilities */}
        <Section title="Nearby Facilities">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Schools">
              <input type="number" className="input-field" min={0} {...register('nearby_schools', { valueAsNumber: true })} />
            </Field>
            <Field label="Hospitals">
              <input type="number" className="input-field" min={0} {...register('nearby_hospital', { valueAsNumber: true })} />
            </Field>
            <Field label="Metro Stations">
              <input type="number" className="input-field" min={0} {...register('nearby_metro', { valueAsNumber: true })} />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <div className="space-y-4">
            <Field label="City *" error={errors.city?.message}>
              <input className="input-field" placeholder="Mumbai"
                {...register('city', { required: 'City required' })} />
            </Field>
            <Field label="Address *" error={errors.address?.message}>
              <textarea rows={2} className="input-field resize-none" placeholder="Full address..."
                {...register('address', { required: 'Address required' })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input type="number" step="any" className="input-field" placeholder="19.0760" {...register('latitude')} />
              </Field>
              <Field label="Longitude">
                <input type="number" step="any" className="input-field" placeholder="72.8777" {...register('longitude')} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <div
                key={a}
                onClick={() => toggleAmenity(a)}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleAmenity(a); }}
                role="button"
                tabIndex={0}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border cursor-pointer select-none ${
                  selectedAmenities.includes(a)
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                }`}
              >
                {a}
              </div>
            ))}
          </div>
          {selectedAmenities.length > 0 && (
            <p className="text-xs text-primary-600 mt-2 font-medium">
              Selected: {selectedAmenities.join(', ')}
            </p>
          )}
        </Section>

        {/* Images */}
        <Section title="Property Images">
          <div className="border-2 border-dashed border-primary-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
            <FiUpload size={28} className="text-primary-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">Upload up to 10 images (JPG, PNG, WebP — max 5MB each)</p>
            <label className="btn-secondary text-sm cursor-pointer">
              Select Images
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full h-20 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={10} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary-700 text-white text-xs px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div className="flex gap-4 pb-6">
          <button
            type="button"
            onClick={() => navigate('/seller/properties')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><FiSave size={14} /> List Property</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
