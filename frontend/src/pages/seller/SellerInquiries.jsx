import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiCheck, FiX, FiClock, FiMessageSquare } from 'react-icons/fi';
import { inquiryService } from '../../services/api';
import { formatRelativeTime, formatPrice } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

const STATUS_TABS = ['all', 'pending', 'contacted', 'closed', 'rejected'];
const STATUS_OPTS = ['pending', 'contacted', 'closed', 'rejected'];

const statusColor = {
  pending: 'badge-yellow', contacted: 'badge-purple',
  closed: 'badge-gray', rejected: 'badge-red'
};

export default function SellerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (tab !== 'all') params.status = tab;
      const res = await inquiryService.getSellerInquiries(params);
      setInquiries(res.data.docs || []);
      setTotal(res.data.totalDocs || 0);
    } catch { toast.error('Failed to load inquiries.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, page]);

  const handleUpdate = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    try {
      const targetId = selected.id || selected._id;
      await inquiryService.updateStatus(targetId, { status: newStatus, sellerNote: note });
      toast.success('Inquiry updated.');
      setSelected(null);
      load();
    } catch { toast.error('Failed to update.'); }
    finally { setUpdating(false); }
  };

  const openModal = (inq) => {
    setSelected(inq);
    setNewStatus(inq.status);
    setNote(inq.sellerNote || '');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Inquiries</h1>
        <p className="page-sub">{total} total inquiries received</p>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${tab === t ? 'bg-primary-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : inquiries.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiMessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700">No inquiries found</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq, i) => (
            <motion.div key={inq.id || inq._id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-5 hover:shadow-card-hover transition-all cursor-pointer"
              onClick={() => openModal(inq)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge capitalize ${statusColor[inq.status]}`}>{inq.status}</span>
                    {!inq.isRead && <span className="badge bg-blue-100 text-blue-700">New</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{inq.buyerName}</h3>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    Re: <span className="font-medium">{inq.propertyTitle}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">{inq.message}</p>
                </div>
                <div className="flex-shrink-0 text-right text-xs text-gray-400">
                  <p>{formatRelativeTime(inq.createdAt)}</p>
                  {(inq.budget || inq.requirements?.budget) && (
                    <p className="text-primary-600 font-medium">Budget: {formatPrice(inq.budget || inq.requirements.budget)}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <a href={`mailto:${inq.buyerEmail}`} onClick={e => e.stopPropagation()}
                      className="p-1.5 bg-gray-100 rounded-lg hover:bg-primary-100 text-gray-500 hover:text-primary-700">
                      <FiMail size={13} />
                    </a>
                    {inq.buyerPhone && (
                      <a href={`tel:${inq.buyerPhone}`} onClick={e => e.stopPropagation()}
                        className="p-1.5 bg-gray-100 rounded-lg hover:bg-green-100 text-gray-500 hover:text-green-700">
                        <FiPhone size={13} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={Math.ceil(total / 10)} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Inquiry Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Buyer</p>
                <p className="font-semibold">{selected.buyerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Property</p>
                <p className="font-semibold text-xs truncate">{selected.propertyTitle}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-xs">{selected.buyerEmail}</p>
              </div>
              {selected.buyerPhone && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-xs">{selected.buyerPhone}</p>
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Message</p>
              <p className="text-sm text-gray-700">{selected.message}</p>
            </div>
            {(selected.budget || selected.requirements?.budget) && (
              <div className="bg-primary-50 rounded-xl p-3">
                <p className="text-xs text-primary-400 mb-1">Budget</p>
                <p className="font-semibold text-primary-700">{formatPrice(selected.budget || selected.requirements.budget)}</p>
              </div>
            )}
            <div>
              <label className="label">Update Status</label>
              <select className="input-field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_OPTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Your Note (optional)</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Add a note for the buyer..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">Close</button>
              <button onClick={handleUpdate} disabled={updating} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {updating ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Update'}
              </button>
            </div>
            <div className="flex gap-3 pt-1 border-t border-gray-100">
              <a href={`mailto:${selected.buyerEmail}`}
                className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
                <FiMail size={13} /> Email Buyer
              </a>
              {selected.buyerPhone && (
                <a href={`tel:${selected.buyerPhone}`}
                  className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2">
                  <FiPhone size={13} /> Call Buyer
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
