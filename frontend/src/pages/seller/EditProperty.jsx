import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { propertyService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TYPES = ['Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'];
const FURNISHED = ['Furnished', 'Semi-Furnished', 'Unfurnished'];
const FACING = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
const AMENITIES = [
  'Swimming Pool', 'Gym', 'Lift', 'Security', 'Power Backup',
  'Garden', 'Club House', 'Play Area', 'CCTV', 'Intercom',
  'Rainwater Harvesting', 'Solar Energy', 'Gas Pipeline', 'Fire Safety',
];

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const toggleAmenity = useCallback((a) => {
    setSelectedAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  }, []);

  useEffect(() => {
    propertyService.getById(id).then(res => {
      const data = res.data;
      reset(data);
      // Parse amenities if they exist
      if (data.amenities) {
        try {
          setSelectedAmenities(typeof data.amenities === 'string' 
            ? JSON.parse(data.amenities) 
            : data.amenities);
        } catch {
          setSelectedAmenities([]);
        }
      }
      setLoading(false);
    }).catch(() => { 
      toast.error('Property not found.'); 
      navigate('/seller/properties'); 
    });
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, v);
      });
      fd.append('amenities', JSON.stringify(selectedAmenities));
      await propertyService.update(id, fd);
      toast.success('Property updated!');
      navigate('/seller/properties');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="page-header">Edit Property</h1>
        <p className="page-sub">Update your property listing</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={4} className="input-field resize-none" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Property Type</label>
              <select className="input-field" {...register('property_type')}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input-field" {...register('status')}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" className="input-field" {...register('price')} />
            </div>
            <div>
              <label className="label">Area (sqft)</label>
              <input type="number" className="input-field" {...register('area_sqft')} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['bedrooms','bathrooms','parking','floor','age_years','road_width','location_score'].map(f => (
              <div key={f}>
                <label className="label capitalize">{f.replace('_',' ')}</label>
                <input type="number" className="input-field" {...register(f)} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Furnished</label>
              <select className="input-field" {...register('furnished')}>
                {FURNISHED.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Facing</label>
              <select className="input-field" {...register('facing')}>
                {FACING.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">City</label>
            <input className="input-field" {...register('city')} />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea rows={2} className="input-field resize-none" {...register('address')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input type="number" step="any" className="input-field" {...register('latitude')} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" step="any" className="input-field" {...register('longitude')} />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="glass-card p-6 space-y-4">
          <label className="label font-semibold">Amenities</label>
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
        </div>

        <div className="flex gap-4 pb-4">
          <button type="button" onClick={() => navigate('/seller/properties')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><FiSave size={14} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
