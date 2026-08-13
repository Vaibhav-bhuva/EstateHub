export const PROPERTY_TYPES = [
  'Apartment', 'Villa', 'House', 'Farm', 'Office', 'Commercial', 'Industrial'
];

export const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'
];

export const FURNISHED_OPTIONS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

export const FACING_OPTIONS = [
  'North', 'South', 'East', 'West',
  'North-East', 'North-West', 'South-East', 'South-West'
];

export const AMENITIES = [
  'Swimming Pool', 'Gym', 'Lift', 'Security', 'Power Backup',
  'Garden', 'Club House', 'Play Area', 'CCTV', 'Intercom',
  'Rainwater Harvesting', 'Solar Energy', 'Gas Pipeline', 'Fire Safety'
];

export const INQUIRY_STATUSES = ['pending', 'contacted', 'closed', 'rejected'];

export const PROPERTY_STATUSES = ['available', 'sold', 'rented', 'archived'];

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'most_viewed', label: 'Most Viewed' },
];

export const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api';
export const NODE_BASE_URL   = import.meta.env.VITE_NODE_API_URL   || 'http://localhost:5000/api';
