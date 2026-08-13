import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { githubLogin } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const role = sessionStorage.getItem('oauth_role') || 'buyer';

    if (!code) {
      toast.error('GitHub authentication failed: No code returned');
      navigate('/login');
      return;
    }

    processed.current = true;
    
    githubLogin(code, role)
      .then((user) => {
        toast.success(`Welcome back, ${user.first_name || user.email}!`);
        if (user.role === 'seller') navigate('/seller/dashboard');
        else if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate('/buyer/dashboard');
      })
      .catch((err) => {
        console.error('GitHub login error:', err);
        toast.error('GitHub login failed. Please try again.');
        navigate('/login');
      });
  }, [location.search, githubLogin, navigate]);

  return <LoadingSpinner fullScreen />;
}
