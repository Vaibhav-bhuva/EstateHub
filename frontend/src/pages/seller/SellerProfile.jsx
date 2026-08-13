import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiCamera, FiLock, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/formatters';

export default function SellerProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { ...user } });
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: pwErrors }, watch } = useForm();

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        address: data.address,
      });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPw(true);
    try {
      await authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      toast.success('Password changed!');
      resetPw();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChangingPw(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await authService.uploadPhoto(fd);
      updateUser(res.data.user);
      toast.success('Photo updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-2">
        <h1 className="page-header">Profile</h1>
        <p className="page-sub">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="glass-card p-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
            {user?.profile_photo_url
              ? <img src={user.profile_photo_url} alt="" className="w-full h-full object-cover" />
              : <FiUser size={32} className="text-primary-500" />}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-800 transition-colors">
            {photoLoading
              ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
              : <FiCamera size={13} className="text-white" />}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="badge badge-purple capitalize mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Profile form */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiUser size={15} /> Personal Information</h3>
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input-field" {...register('first_name')} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input-field" {...register('last_name')} />
            </div>
          </div>
          <div>
            <label className="label">Email (read-only)</label>
            <input className="input-field bg-gray-50" readOnly value={user?.email || ''} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" className="input-field" placeholder="Enter 10-digit mobile number"
              {...register('phone', {
                validate: (val) => !val || /^[6-9]\d{9}$/.test(val) || 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9'
              })} />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Address</label>
            <textarea rows={3} className="input-field resize-none" {...register('address')} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><FiSave size={13} /> Save Changes</>}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiLock size={15} /> Change Password</h3>
        <form onSubmit={handlePw(onChangePassword)} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" {...regPw('old_password', { required: 'Required' })} />
            {pwErrors.old_password && <p className="text-red-500 text-xs mt-1">{pwErrors.old_password.message}</p>}
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" {...regPw('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} />
            {pwErrors.new_password && <p className="text-red-500 text-xs mt-1">{pwErrors.new_password.message}</p>}
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input-field"
              {...regPw('confirm_password', {
                required: 'Required',
                validate: v => v === watch('new_password') || 'Passwords do not match'
              })} />
            {pwErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{pwErrors.confirm_password.message}</p>}
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary text-sm flex items-center gap-2">
            {changingPw ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
