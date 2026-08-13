import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { inquiryService } from '../../services/api';
import { formatRelativeTime, formatPrice, getStatusColor } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';

export default function BuyerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await inquiryService.getBuyerInquiries({ page, limit: 10 });
      setInquiries(res.data.docs || []);
      setTotal(res.data.totalDocs || 0);
    } catch { toast.error('Failed to load inquiries.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this inquiry?')) return;
    setCancelling(id);
    try {
      await inquiryService.cancel(id);
      toast.info('Inquiry cancelled.');
      load();
    } catch { toast.error('Failed to cancel.'); }
    finally { setCancelling(null); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">My Inquiries</h1>
        <p className="page-sub">{total} inquiries sent</p>
      </div>

      {loading ? <LoadingSpinner /> : inquiries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiMessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">No inquiries yet</h3>
          <p className="text-gray-400 text-sm mt-1 mb-4">Send inquiries on properties you're interested in</p>
          <Link to="/properties" className="btn-primary text-sm">Browse Properties</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {inquiries.map((inq, i) => (
              <motion.div key={inq.id || inq._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4 hover:shadow-card-hover transition-all cursor-pointer"
                onClick={() => setSelected(inq)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge capitalize ${getStatusColor(inq.status)}`}>{inq.status}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{inq.propertyTitle}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{inq.propertyCity}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">"{inq.message}"</p>
                  </div>
                  <div className="text-right text-xs text-gray-400 flex-shrink-0">
                    <p>{formatRelativeTime(inq.createdAt || inq.created_at)}</p>
                    {(inq.budget || inq.requirements?.budget) && (
                      <p className="text-primary-600 font-medium">Budget: {formatPrice(inq.budget || inq.requirements.budget)}</p>
                    )}
                    {['pending', 'contacted'].includes(inq.status) && (
                      <button
                        onClick={e => { e.stopPropagation(); handleCancel(inq.id || inq._id); }}
                        disabled={cancelling === (inq.id || inq._id)}
                        className="mt-2 flex items-center gap-1 text-red-500 hover:text-red-700 ml-auto"
                      >
                        <FiX size={11} /> Cancel
                      </button>
                    )}
                  </div>
                </div>
                {inq.sellerNote && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5">
                    <strong>Seller note:</strong> {inq.sellerNote}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={Math.ceil(total / 10)} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Inquiry Details">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Property</p>
                <p className="font-semibold text-xs">{selected.propertyTitle}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Status</p>
                <span className={`badge capitalize ${getStatusColor(selected.status)}`}>{selected.status}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Seller</p>
                <p className="font-semibold">{selected.sellerName || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Date</p>
                <p>{new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Your Message</p>
              <p className="text-sm">{selected.message}</p>
            </div>
            {selected.sellerNote && (
              <div className="bg-primary-50 rounded-xl p-3">
                <p className="text-xs text-primary-400 mb-1">Seller's Response</p>
                <p className="text-sm text-primary-800">{selected.sellerNote}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Link to={`/properties/${selected.propertyId}`}
                className="btn-secondary flex-1 text-sm text-center">View Property</Link>
              <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
