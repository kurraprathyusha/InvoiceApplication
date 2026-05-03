import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { loginSchema } from '../utils/validators';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-primary-dark" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -top-10 -left-10 w-52 h-52 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center text-white max-w-sm">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">InvoicePro</h1>
          <p className="text-indigo-200 text-base leading-relaxed">
            Create professional invoices, manage customers, and track payments — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['Fast', 'Create invoices in seconds'], ['Smart', 'Auto-calculate taxes'], ['Secure', 'JWT-protected data']].map(([title, desc]) => (
              <div key={title} className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-indigo-200 mt-0.5 leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Invoice<span className="text-primary">Pro</span></span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-1.5 text-sm text-gray-500">Welcome back! Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" placeholder="••••••••" {...register('password')} error={errors.password?.message} />
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
