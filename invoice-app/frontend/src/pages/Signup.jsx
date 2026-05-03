import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { signupSchema } from '../utils/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
  const { signup } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(signupSchema)
  });

  const onSubmit = async (data) => {
    try {
      // Exclude confirmPassword
      const { confirmPassword, ...submitData } = data;
      await signup(submitData);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name *" {...register('name')} error={errors.name?.message} />
          <Input label="Email address *" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password *" type="password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirm Password *" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
          <Input label="Company Name" {...register('companyName')} error={errors.companyName?.message} />
          <Input label="Address" {...register('address')} error={errors.address?.message} />

          <Button type="submit" className="w-full mt-6" isLoading={isSubmitting}>
            Sign up
          </Button>
          <div className="text-sm text-center mt-4">
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
