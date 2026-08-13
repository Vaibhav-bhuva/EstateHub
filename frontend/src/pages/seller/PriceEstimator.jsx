import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiTrendingUp } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { mlService } from '../../services/api';
import { getErrorMessage } from '../../utils/formatters';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PriceGauge from '../../components/ml/PriceGauge';
import ModelInfoCard from '../../components/ml/ModelInfoCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata','Ahmedabad','Jaipur','Surat'];
const TYPES = ['Apartment','Villa','House','Farm','Office','Commercial','Industrial'];
const FURNISHED = ['Furnished','Semi-Furnished','Unfurnished'];
const FACING = ['North','South','East','West','North-East','North-West','South-East','South-West'];

export default function PriceEstimator() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      city: 'Mumbai', property_type: 'Apartment', furnished: 'Unfurnished',
      facing: 'North', area_sqft: 1000, bedrooms: 2, bathrooms: 2,
      age_years: 0, floor: 5, parking: 1, road_width: 30,
      location_score: 6, nearby_schools: 3, nearby_hospital: 1, nearby_metro: 1,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ...data,
        area_sqft: Number(data.area_sqft), bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms), age_years: Number(data.age_years),
        floor: Number(data.floor), parking: Number(data.parking),
        road_width: Number(data.road_width), location_score: Number(data.location_score),
        nearby_schools: Number(data.nearby_schools), nearby_hospital: Number(data.nearby_hospital),
        nearby_metro: Number(data.nearby_metro),
        seller_price: data.seller_price ? Number(data.seller_price) : undefined,
      };
      const res = await mlService.predictPrice(payload);
      setResult(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const chartData = result ? {
    labels: ['Below Market', 'AI Estimate', 'Above Market'],
    datasets: [{
      label: 'Price (₹)',
      data: [
        result.market_comparison.below_market,
        result.market_comparison.market_price,
        result.market_comparison.above_market,
      ],
      backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(124,58,237,0.85)', 'rgba(234,179,8,0.7)'],
      borderRadius: 8,
    }],
  } : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiCpu size={22} className="text-primary-600" /> AI Price Estimator</h1>
        <p className="page-sub">Get an AI-powered property valuation before listing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Property Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <select className="input-field" {...register('city', { required: true })}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Property Type</label>
                <select className="input-field" {...register('property_type')}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Area (sqft)</label>
                <input type="number" className="input-field" min={50} {...register('area_sqft', { required: true, min: 50 })} />
              </div>
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" className="input-field" min={0} max={20} {...register('bedrooms')} />
              </div>
              <div>
                <label className="label">Bathrooms</label>
                <input type="number" className="input-field" min={0} max={20} {...register('bathrooms')} />
              </div>
              <div>
                <label className="label">Age (years)</label>
                <input type="number" className="input-field" min={0} {...register('age_years')} />
              </div>
              <div>
                <label className="label">Floor</label>
                <input type="number" className="input-field" min={0} {...register('floor')} />
              </div>
              <div>
                <label className="label">Parking</label>
                <input type="number" className="input-field" min={0} {...register('parking')} />
              </div>
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
              <div>
                <label className="label">Road Width (ft)</label>
                <input type="number" className="input-field" min={5} {...register('road_width')} />
              </div>
              <div>
                <label className="label">Location Score (1-10)</label>
                <input type="number" className="input-field" min={1} max={10} step={0.1} {...register('location_score')} />
              </div>
              <div>
                <label className="label">Nearby Schools</label>
                <input type="number" className="input-field" min={0} {...register('nearby_schools')} />
              </div>
              <div>
                <label className="label">Nearby Hospitals</label>
                <input type="number" className="input-field" min={0} {...register('nearby_hospital')} />
              </div>
              <div>
                <label className="label">Nearby Metro</label>
                <input type="number" className="input-field" min={0} {...register('nearby_metro')} />
              </div>
              <div>
                <label className="label">Your Price (₹, optional)</label>
                <input type="number" className="input-field" placeholder="Compare with AI" {...register('seller_price')} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Predicting...</>
                : <><FiCpu size={15} /> Predict Price</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Model status */}
          <ModelInfoCard />

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Price gauge */}
                <PriceGauge result={result} />

                {/* Market comparison chart */}
                <div className="glass-card p-5">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">Market Comparison</h4>
                  <div style={{ height: 180 }}>
                    <Bar data={chartData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: '#f3f4f6' }, ticks: { callback: v => `₹${(v/1e5).toFixed(0)}L` } }
                      }
                    }} />
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/seller/properties/add', { state: { estimated_price: result.estimated_price } })}
                  className="btn-primary w-full text-sm"
                >
                  Publish Property with this Price
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !loading && (
            <div className="glass-card p-10 text-center">
              <FiTrendingUp size={40} className="text-primary-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-700 text-sm">Fill in property details</h3>
              <p className="text-gray-400 text-xs mt-1">Our AI will estimate the market price</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
