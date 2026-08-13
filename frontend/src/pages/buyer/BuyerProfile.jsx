import React from 'react';
import SellerProfile from '../seller/SellerProfile';

// Buyer profile reuses the same form; role is shown from context
export default function BuyerProfile() {
  return <SellerProfile />;
}
