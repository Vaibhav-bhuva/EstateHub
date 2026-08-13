import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const isFetchingRef = useRef(false);

  const fetchWishlist = useCallback(async (silent = false) => {
    if (!user || user.role !== 'buyer') {
      setItems([]);
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!silent) setLoading(true);
    try {
      const res = await wishlistService.get();
      const fetchedItems = Array.isArray(res.data?.items) ? res.data.items : [];
      setItems(fetchedItems);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      if (!silent) setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user]);

  // Load wishlist when buyer user logs in or mounts
  useEffect(() => {
    if (user?.role === 'buyer') {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [user, fetchWishlist]);

  // Check if a property is in the wishlist
  const isWishlisted = useCallback((propertyId) => {
    if (!propertyId) return false;
    const targetId = String(propertyId);
    return items.some(item => {
      const pId = String(item.propertyId || item.property || item.property_details?.id || '');
      const iId = String(item.id || '');
      return pId === targetId || iId === targetId;
    });
  }, [items]);

  // Toggle wishlist state for a property
  const toggle = async (property) => {
    if (!user) {
      toast.info('Please log in to save properties to your wishlist.');
      return false;
    }

    if (user.role !== 'buyer') {
      toast.warning('Only buyer accounts can save properties to wishlist.');
      return false;
    }

    const propId = property?.id || property?.propertyId || property;
    if (!propId) {
      toast.error('Invalid property identifier.');
      return false;
    }

    const currentlySaved = isWishlisted(propId);
    const prevItems = [...items];

    // Mark as toggling in progress
    setTogglingIds(prev => new Set(prev).add(propId));

    try {
      if (currentlySaved) {
        // Optimistic remove
        setItems(prev => prev.filter(i => {
          const pId = String(i.propertyId || i.property || i.property_details?.id || '');
          const iId = String(i.id || '');
          return pId !== String(propId) && iId !== String(propId);
        }));

        await wishlistService.remove(propId);
        toast.info('Removed from wishlist');
      } else {
        // Optimistic add (temporary object until refetch)
        const optimisticItem = {
          id: `temp-${Date.now()}`,
          propertyId: propId,
          property: propId,
          propertyTitle: property.title || 'Saved Property',
          propertyType: property.property_type || property.propertyType || 'Property',
          propertyCity: property.city || property.propertyCity || '',
          price: property.price,
          area: property.area_sqft || property.area,
          bedrooms: property.bedrooms,
          primaryImage: property.primary_image || property.primaryImage || (property.images?.[0]?.image_url ?? null),
          primary_image: property.primary_image || property.primaryImage || null,
          note: '',
          addedAt: new Date().toISOString(),
          property_details: property,
        };

        setItems(prev => [optimisticItem, ...prev]);

        await wishlistService.add({ propertyId: propId });
        toast.success('Added to wishlist');
        // Fetch fresh server state silently
        fetchWishlist(true);
      }
      return true;
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      // Rollback on error
      setItems(prevItems);
      toast.error('Failed to update wishlist. Please try again.');
      return false;
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(propId);
        return next;
      });
    }
  };

  // Remove directly
  const removeFromWishlist = async (propertyId) => {
    const prevItems = [...items];
    setItems(prev => prev.filter(i => {
      const pId = String(i.propertyId || i.property || i.property_details?.id || '');
      const iId = String(i.id || '');
      return pId !== String(propertyId) && iId !== String(propertyId);
    }));

    try {
      await wishlistService.remove(propertyId);
      toast.info('Removed from wishlist.');
      return true;
    } catch (err) {
      console.error('Failed to remove wishlist item:', err);
      setItems(prevItems);
      toast.error('Failed to remove from wishlist.');
      return false;
    }
  };

  // Update note
  const updateNote = async (propertyId, note) => {
    try {
      const res = await wishlistService.updateNote(propertyId, note);
      setItems(prev => prev.map(item => {
        const pId = String(item.propertyId || item.property || item.property_details?.id || '');
        const iId = String(item.id || '');
        if (pId === String(propertyId) || iId === String(propertyId)) {
          return { ...item, note };
        }
        return item;
      }));
      toast.success('Note updated successfully!');
      return res.data;
    } catch (err) {
      console.error('Failed to update note:', err);
      toast.error('Failed to save note.');
      throw err;
    }
  };

  // Clear all
  const clearWishlist = async () => {
    const prevItems = [...items];
    setItems([]);
    try {
      await wishlistService.clear();
      toast.info('Wishlist cleared.');
      return true;
    } catch (err) {
      console.error('Failed to clear wishlist:', err);
      setItems(prevItems);
      toast.error('Failed to clear wishlist.');
      return false;
    }
  };

  const value = {
    items,
    total: items.length,
    loading,
    togglingIds,
    isWishlisted,
    toggle,
    removeFromWishlist,
    updateNote,
    clearWishlist,
    fetch: fetchWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return ctx;
};
