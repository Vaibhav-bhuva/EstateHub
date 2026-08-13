import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiArchive, FiRefreshCw } from 'react-icons/fi';
import { propertyService } from '../../services/api';
import { formatPrice, formatArea, formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const STATUS_TABS = ['all', 'available', 'sold', 'rented', 'archived'];

export default function SellerProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? { status: tab } : {};
      const res = await propertyService.getSellerProperties(params);
      setProperties(res.data.results || []);
    } catch { toast.error('Failed to load properties.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await propertyService.delete(id);
      toast.success('Property deleted.');
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const handleArchive = async (id) => {
    try {
      await propertyService.archive(id);
      toast.success('Property archived.');
      load();
    } catch { toast.error('Failed to archive.'); }
  };

  const handleRepublish = async (id) => {
    try {
      await propertyService.republish(id);
      toast.success('Property republished.');
      load();
    } catch { toast.error('Failed to republish.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header">My Properties</h1>
          <p className="page-sub">Manage your listings</p>
        </div>
        <Link to="/seller/properties/add" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={14} /> Add Property
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${tab === t ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : properties.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="font-semibold text-gray-700 mb-2">No properties found</h3>
          <Link to="/seller/properties/add" className="btn-primary text-sm mt-2 inline-flex items-center gap-2">
            <FiPlus size={13} /> Add your first property
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-purple-50 flex-shrink-0">
                {p.primary_image
                  ? <img src={p.primary_image} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                  <span className={`badge capitalize ${getStatusColor(p.status)}`}>{p.status}</span>
                </div>
                <p className="text-xs text-gray-400">{p.city} · {p.property_type} · {formatArea(p.area_sqft)}</p>
                <p className="text-sm font-bold text-primary-700 mt-1">{formatPrice(p.price)}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span><FiEye size={11} className="inline mr-0.5" />{p.views_count}</span>
                <span>📅 {formatDate(p.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to={`/properties/${p.id}`}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-primary-100 text-gray-500 hover:text-primary-700 transition-colors" title="View">
                  <FiEye size={14} />
                </Link>
                <Link to={`/seller/properties/edit/${p.id}`}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-colors" title="Edit">
                  <FiEdit2 size={14} />
                </Link>
                {p.status !== 'archived' ? (
                  <button onClick={() => handleArchive(p.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-100 text-gray-500 hover:text-yellow-600 transition-colors" title="Archive">
                    <FiArchive size={14} />
                  </button>
                ) : (
                  <button onClick={() => handleRepublish(p.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors" title="Republish">
                    <FiRefreshCw size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors" title="Delete">
                  {deleting === p.id
                    ? <span className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin block" />
                    : <FiTrash2 size={14} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
