import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiEdit2, FiMapPin, FiHome, FiMaximize, FiExternalLink, FiFolderMinus } from 'react-icons/fi';
import { useWishlist } from '../../hooks/useWishlist';
import { formatPrice, formatArea } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function Wishlist() {
  const { items, loading, removeFromWishlist, updateNote, clearWishlist } = useWishlist();
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [clearModal, setClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const getItemData = (item) => {
    const propertyId = item.propertyId || item.property || item.property_details?.id || item.id;
    const propertyTitle = item.propertyTitle || item.title || item.property_details?.title || 'Saved Property';
    const propertyType = item.propertyType || item.property_type || item.property_details?.property_type || 'Property';
    const propertyCity = item.propertyCity || item.city || item.property_details?.city || '';
    const price = item.price || item.property_details?.price;
    const area = item.area || item.area_sqft || item.property_details?.area_sqft;
    const bedrooms = item.bedrooms || item.property_details?.bedrooms;
    const primaryImage = item.primaryImage || item.primary_image || item.property_details?.primary_image;
    return { propertyId, propertyTitle, propertyType, propertyCity, price, area, bedrooms, primaryImage, note: item.note };
  };

  const handleRemove = async (propertyId) => {
    await removeFromWishlist(propertyId);
  };

  const openNoteModal = (item) => {
    const data = getItemData(item);
    setNoteModal({ ...data, rawItem: item });
    setNote(data.note || '');
  };

  const saveNote = async () => {
    if (!noteModal) return;
    setSavingNote(true);
    try {
      await updateNote(noteModal.propertyId, note);
      setNoteModal(null);
    } catch {
      // toast is already handled in context
    } finally {
      setSavingNote(false);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    await clearWishlist();
    setClearing(false);
    setClearModal(false);
  };

  if (loading && items.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm">
              <FiHeart size={20} className="fill-rose-500" />
            </span>
            My Wishlist
          </h1>
          <p className="page-sub mt-1">
            {items.length === 1 ? '1 property saved' : `${items.length} properties saved`} for comparison
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2.5">
            <Link to="/properties" className="btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5">
              <FiExternalLink size={14} /> Browse More
            </Link>
            <button
              onClick={() => setClearModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors flex items-center gap-1.5"
            >
              <FiFolderMinus size={14} /> Clear Wishlist
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 sm:p-16 text-center max-w-lg mx-auto border border-purple-100/80">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <FiHeart size={32} />
          </div>
          <h3 className="font-bold text-gray-800 text-lg mb-1">Your wishlist is empty</h3>
          <p className="text-gray-400 text-sm mb-6">
            Click the heart icon on any property to save it to your wishlist and easily compare your favorites later.
          </p>
          <Link to="/properties" className="btn-primary text-sm inline-flex items-center gap-2 shadow-md">
            Explore Available Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {items.map((item, i) => {
              const data = getItemData(item);
              return (
                <motion.div
                  key={data.propertyId || item.id || i}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card overflow-hidden group hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between border border-purple-100/60"
                >
                  <div>
                    {/* Thumbnail */}
                    <Link to={`/properties/${data.propertyId}`} className="block relative">
                      <div className="h-48 bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 overflow-hidden relative">
                        {data.primaryImage ? (
                          <img
                            src={data.primaryImage}
                            alt={data.propertyTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-80">
                            🏠
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary-800/90 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-xl shadow-sm">
                            {data.propertyType}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link to={`/properties/${data.propertyId}`}>
                        <h3 className="font-bold text-gray-900 text-base mb-1 truncate hover:text-primary-700 transition-colors">
                          {data.propertyTitle}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3 font-medium">
                        <FiMapPin size={12} className="text-primary-500 flex-shrink-0" />
                        <span className="truncate">{data.propertyCity || 'Location not specified'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-purple-50/50 rounded-xl p-2 mb-3 text-xs font-semibold text-gray-600 border border-purple-100/50">
                        <div className="flex items-center gap-1.5 truncate">
                          <FiHome size={13} className="text-primary-600" />
                          <span>{data.bedrooms ? `${data.bedrooms} Bed` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <FiMaximize size={13} className="text-primary-600" />
                          <span>{data.area ? formatArea(data.area) : '—'}</span>
                        </div>
                      </div>

                      {data.price && (
                        <p className="text-primary-700 font-extrabold text-base mb-3">
                          {formatPrice(data.price)}
                        </p>
                      )}

                      {/* Note snippet */}
                      {data.note ? (
                        <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-2.5 mb-3 text-xs text-amber-800">
                          <span className="font-bold block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">My Note:</span>
                          <p className="italic line-clamp-2">"{data.note}"</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1 flex items-center gap-2 border-t border-purple-50">
                    <button
                      onClick={() => openNoteModal(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-700 text-xs font-semibold transition-colors"
                    >
                      <FiEdit2 size={12} /> {data.note ? 'Edit Note' : 'Add Note'}
                    </button>
                    <button
                      onClick={() => handleRemove(data.propertyId)}
                      title="Remove from wishlist"
                      className="p-2 rounded-xl bg-gray-100 hover:bg-rose-100 text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Note Modal */}
      <Modal isOpen={!!noteModal} onClose={() => setNoteModal(null)} title="Personal Property Note" size="sm">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Property</p>
            <p className="text-sm font-bold text-gray-800 truncate">{noteModal?.propertyTitle}</p>
          </div>
          <textarea
            rows={4}
            className="input-field resize-none text-sm"
            placeholder="Add private notes (e.g., 'Loved the balcony view, schedule visit this weekend')..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={() => setNoteModal(null)} className="btn-secondary flex-1 text-sm">
              Cancel
            </button>
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
            >
              {savingNote ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Save Note'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Clear Modal */}
      <Modal isOpen={clearModal} onClose={() => setClearModal(false)} title="Clear Entire Wishlist?" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to remove all <strong>{items.length}</strong> saved properties from your wishlist? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setClearModal(false)} className="btn-secondary flex-1 text-sm">
              Keep Wishlist
            </button>
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-xl text-sm flex-1 flex items-center justify-center gap-2 transition-colors"
            >
              {clearing ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Yes, Clear All'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

