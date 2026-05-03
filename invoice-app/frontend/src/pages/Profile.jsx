import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, changePassword } from '../api/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup.string().nullable(),
  companyName: yup.string().nullable(),
  address: yup.string().nullable(),
});

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'At least 6 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Confirm password is required'),
});

const Profile = () => {
  const { user, updateUser } = useAuth();

  const { register: rp, handleSubmit: hp, formState: { errors: pe, isSubmitting: ps } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', companyName: user?.companyName || '', address: user?.address || '' }
  });

  const { register: rw, handleSubmit: hw, reset: resetPw, formState: { errors: we, isSubmitting: ws } } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onProfileSubmit = async (data) => {
    try {
      const updatedUser = await updateProfile(data);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPw();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and password.</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-400">Update your name, phone, and company details.</p>
          </div>
        </div>
        <form onSubmit={hp(onProfileSubmit)} className="space-y-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
            <Input label="Full Name *" {...rp('name')} error={pe.name?.message} />
            <Input label="Phone" placeholder="+91 98765 43210" {...rp('phone')} error={pe.phone?.message} />
            <Input label="Company Name" placeholder="Acme Corp" {...rp('companyName')} error={pe.companyName?.message} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea
              {...rp('address')}
              rows={3}
              placeholder="123 Main St, City, State"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={ps}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
            <p className="text-xs text-gray-400">Use a strong password at least 6 characters long.</p>
          </div>
        </div>
        <form onSubmit={hw(onPasswordSubmit)} className="space-y-0">
          <Input type="password" label="Current Password *" placeholder="••••••••" {...rw('currentPassword')} error={we.currentPassword?.message} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input type="password" label="New Password *" placeholder="Min. 6 characters" {...rw('newPassword')} error={we.newPassword?.message} />
            <Input type="password" label="Confirm New Password *" placeholder="Repeat new password" {...rw('confirmPassword')} error={we.confirmPassword?.message} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={ws}>Update Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
