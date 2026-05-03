import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
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

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isSubmitting: isProfileSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      companyName: user?.companyName || '',
      address: user?.address || ''
    }
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting } } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  const onProfileSubmit = async (data) => {
    try {
      const updatedUser = await updateProfile(data);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email" value={user?.email || ''} disabled className="bg-gray-50" />
            <Input label="Name *" {...registerProfile('name')} error={profileErrors.name?.message} />
            <Input label="Phone" {...registerProfile('phone')} error={profileErrors.phone?.message} />
            <Input label="Company Name" {...registerProfile('companyName')} error={profileErrors.companyName?.message} />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
            <textarea
              {...registerProfile('address')}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${
                profileErrors.address ? 'border-danger' : 'border-gray-300'
              }`}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isProfileSubmitting}>
              Update Profile
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <Input type="password" label="Current Password *" {...registerPassword('currentPassword')} error={passwordErrors.currentPassword?.message} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="password" label="New Password *" {...registerPassword('newPassword')} error={passwordErrors.newPassword?.message} />
            <Input type="password" label="Confirm Password *" {...registerPassword('confirmPassword')} error={passwordErrors.confirmPassword?.message} />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isPasswordSubmitting}>
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile;
