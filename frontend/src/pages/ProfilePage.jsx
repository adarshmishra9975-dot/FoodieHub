import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg('New password and confirm password do not match');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await updateProfile(payload);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setErrorMsg(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during profile update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">User Profile</h1>
        <p className="text-sm text-stone-500 mt-1">Manage your personal information and delivery preferences.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Card Summary */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-lg">{user?.name}</h3>
            <p className="text-xs text-stone-500">{user?.email}</p>
            <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-orange-100 text-orange-800">
              Role: {user?.role}
            </span>
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-2 text-left">
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>{user?.phone || 'No phone set'}</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <span>{user?.address || 'No default delivery address configured'}</span>
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h2 className="text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
              Update Information
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Email Address (Account Identifier)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-stone-100 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-500 cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Email cannot be changed directly.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Default Delivery Address
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Building, Flat No, City, Pincode"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100">
              <h3 className="text-sm font-bold text-stone-800 mb-2">Change Password (Optional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave empty to keep current"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter new password"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 active:scale-98 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl shadow-sm flex items-center gap-2 text-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
