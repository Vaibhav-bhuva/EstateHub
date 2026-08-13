import React, { useEffect, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { inquiryService } from '../../services/api';
import { formatDate, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inquiryService.getAllInquiries({ page, limit: 20 });
      setInquiries(res.data.docs || []);
      setTotal(res.data.totalDocs || 0);
    } catch {
      toast.error('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header flex items-center gap-2"><FiMessageSquare size={20} /> Inquiries</h1>
        <p className="page-sub">{total} total inquiries</p>
      </div>

      {loading ? <LoadingSpinner /> : inquiries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiMessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No inquiries found</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Buyer', 'Property', 'City', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inquiries.map(inq => (
                    <tr key={inq.id || inq._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{inq.buyerName}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{inq.propertyTitle}</td>
                      <td className="px-4 py-3 text-gray-400">{inq.propertyCity || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${getStatusColor(inq.status)}`}>{inq.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(inq.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
