export const formatPrice = (price) => {
  if (!price) return '₹0';
  const num = parseFloat(price);
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000) return `₹${(num / 1_00_000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
};

export const formatArea = (sqft) => {
  if (!sqft) return '0 sqft';
  return `${Number(sqft).toLocaleString('en-IN')} sqft`;
};

export const getStatusColor = (status) => {
  const map = {
    available: 'badge-green',
    sold: 'badge-red',
    rented: 'badge-purple',
    archived: 'badge-gray',
    pending: 'badge-yellow',
    contacted: 'badge-purple',
    closed: 'badge-gray',
    rejected: 'badge-red',
  };
  return map[status] || 'badge-gray';
};

export const getPropertyTypeIcon = (type) => {
  const map = {
    Apartment: '🏢', Villa: '🏡', House: '🏠', Farm: '🌾',
    Office: '🏗️', Commercial: '🏪', Industrial: '🏭',
  };
  return map[type] || '🏠';
};

export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + '...' : str;

export const getErrorMessage = (err) => {
  if (!err) return 'Something went wrong.';
  const data = err.response?.data;
  if (typeof data === 'string') return data;
  if (data?.error) return data.error;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;
  if (data?.errors) return Object.values(data.errors).flat().join(', ');
  if (data?.non_field_errors) return data.non_field_errors.join(', ');
  return err.message || 'Something went wrong.';
};
