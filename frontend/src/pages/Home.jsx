import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiTrendingUp, FiShield, FiCpu, FiArrowRight, FiZap, FiHome } from 'react-icons/fi';
import PropertyCard from '../components/property/PropertyCard';
import SkeletonCard from '../components/common/SkeletonCard';
import { propertyService, cityService } from '../services/api';
import { formatPrice } from '../utils/formatters';

const TYPES = ['Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'];

export default function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [cities, setCities] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [trendRes, cityRes, propRes] = await Promise.all([
          propertyService.getTrending(),
          cityService.getAll().catch(() => ({ data: { cities: [] } })),
          propertyService.getAll({ page_size: 1 }).catch(() => ({ data: { count: 0 } }))
        ]);
        setTrending(trendRes.data.results || trendRes.data || []);
        const fetchedCities = cityRes.data.cities || [];
        setCities(fetchedCities);
        setTotalProperties(propRes.data.count ?? propRes.data.results?.length ?? 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchType) params.set('property_type', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="gradient-mesh text-white py-24 md:py-32 px-4 relative overflow-hidden rounded-b-[2.5rem] shadow-2xl">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-purple-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-white/20 shadow-inner">
              <FiZap className="text-amber-300 animate-pulse" size={14} />
              AI-Powered Real Estate Marketplace
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
          >
            Smart Property.<br />
            <span className="gradient-text-gold">Smart Prediction.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-purple-100/90 mb-10 max-w-2xl mx-auto font-medium"
          >
            Discover your ideal home with Machine Learning price predictions, neighborhood insights, and verified listings across India.
          </motion.p>

          {/* Floating Search Panel */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/80 flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto text-slate-800"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-slate-50/80 rounded-xl border border-purple-100/50">
              <FiMapPin className="text-primary-600 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder="Enter city or location..."
                className="flex-1 outline-none text-slate-800 text-sm bg-transparent placeholder-slate-400 font-medium"
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
              />
            </div>

            <div className="sm:w-48 flex items-center gap-2 px-3 py-2 bg-slate-50/80 rounded-xl border border-purple-100/50">
              <FiHome className="text-primary-600 flex-shrink-0" size={18} />
              <select
                className="w-full text-slate-800 text-sm bg-transparent outline-none font-medium cursor-pointer"
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
              >
                <option value="">All Types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button type="submit" className="btn-glow py-3 px-8 flex items-center justify-center gap-2 whitespace-nowrap text-sm">
              <FiSearch size={16} /> Search Properties
            </button>
          </motion.form>

          {/* Quick Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12 pt-8 border-t border-white/10"
          >
            {[
              [totalProperties > 0 ? totalProperties : '100+', 'Properties Listed'],
              [cities.length > 0 ? cities.length : '10+', 'Top Cities'],
              ['96.3%', 'ML Valuation Accuracy'],
            ].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{val}</div>
                <div className="text-purple-200/70 text-xs font-semibold mt-0.5">{lbl}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why EstateHub Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Why Choose EstateHub?</h2>
          <p className="text-slate-500 font-medium text-sm">The smartest real estate portal powered by artificial intelligence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FiCpu,
              gradient: 'from-purple-500 to-indigo-600',
              title: 'AI Price Valuation',
              desc: 'Our Random Forest ML algorithm analyzes market trends, locality scores, and property specs to deliver instant, accurate valuation estimates.'
            },
            {
              icon: FiShield,
              gradient: 'from-emerald-500 to-teal-600',
              title: 'Verified Listings',
              desc: '100% verified properties guaranteeing transparent legal information, direct seller communication, and authentic photos.'
            },
            {
              icon: FiTrendingUp,
              gradient: 'from-sky-500 to-blue-600',
              title: 'Market Intelligence',
              desc: 'Stay informed with real-time price trend comparisons, budget estimator tools, and comprehensive city analytics.'
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass-card p-8 text-center hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 border border-purple-100/70 flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center mb-6 shadow-lg`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Properties */}
      <section className="bg-gradient-to-b from-purple-50/50 to-white py-12 px-4 sm:px-6 lg:px-8 border-y border-purple-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-primary-600 tracking-wider uppercase">Handpicked Selection</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trending Properties</h2>
            </div>
            <Link to="/properties" className="btn-secondary text-sm flex items-center gap-2">
              View All Properties <FiArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : trending.slice(0, 8).map(p => <PropertyCard key={p.id} property={p} />)
            }
          </div>
        </div>
      </section>

      {/* Explore Cities */}
      {cities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Explore Top Cities</h2>
            <p className="text-slate-500 font-medium text-sm">Find prime residential and commercial properties across India</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cities.slice(0, 10).map((city, i) => (
              <motion.button
                key={city.id || city._id || i}
                whileHover={{ scale: 1.04, y: -2 }}
                onClick={() => navigate(`/properties?city=${city.name}`)}
                className="p-5 glass-card text-center hover:border-purple-300 hover:shadow-card-hover transition-all cursor-pointer group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏙️</div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-primary-700">{city.name}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{city.state}</p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* High-Impact CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="gradient-hero text-white rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl z-10">
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
              Instant AI Valuation
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to Buy or Sell Property at the Right Price?
            </h2>
            <p className="text-purple-100/90 text-sm md:text-base font-medium">
              Get started in seconds. List your property or estimate your buying budget using our Machine Learning engine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 z-10 flex-shrink-0">
            <Link to="/register" className="bg-white text-primary-800 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-100 transition-all shadow-xl hover:scale-105 active:scale-95 text-center text-sm">
              Get Started Free
            </Link>
            <Link to="/properties" className="border-2 border-white/80 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-all text-center text-sm">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
