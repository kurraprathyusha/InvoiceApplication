import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
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
      const { confirmPassword, ...submitData } = data;
      await signup(submitData);
      toast.success('Account created! Welcome aboard.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Invoice<span className="text-primary">Pro</span></span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-1.5 text-sm text-gray-500">Start managing invoices professionally.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input label="Full Name *" placeholder="John Smith" {...register('name')} error={errors.name?.message} />
              <Input label="Email address *" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
              <Input label="Password *" type="password" placeholder="Min. 6 characters" {...register('password')} error={errors.password?.message} />
              <Input label="Confirm Password *" type="password" placeholder="Repeat password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
              <Input label="Phone" placeholder="+91 98765 43210" {...register('phone')} error={errors.phone?.message} />
              <Input label="Company Name" placeholder="Acme Corp" {...register('companyName')} error={errors.companyName?.message} />
            </div>
            <Input label="Address" placeholder="123 Main St, City, State" {...register('address')} error={errors.address?.message} />

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
