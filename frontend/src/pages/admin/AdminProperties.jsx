import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiEye } from 'react-icons/fi';
import { propertyService } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await propertyService.getAll({ page });
      setProperties(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiHome size={20} /> Properties</h1>
        <p className="page-sub">{total} total properties</p>
      </div>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Title', 'Type', 'City', 'Price', 'Status', 'Views', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                      <td className="px-4 py-3 text-gray-500">{p.property_type}</td>
                      <td className="px-4 py-3 text-gray-500">{p.city}</td>
                      <td className="px-4 py-3 font-semibold text-primary-700">{formatPrice(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${getStatusColor(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400"><FiEye size={11} className="inline mr-1" />{p.views_count}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <Link to={`/properties/${p.id}`} className="p-1.5 rounded-lg hover:bg-primary-100 text-gray-400 hover:text-primary-700 transition-colors inline-flex">
                          <FiEye size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 12)} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
